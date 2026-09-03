/**
 * What the stylesheet cannot do, and nothing else. Two things live here, each
 * documented at its own function:
 *
 * - the project overview is given a single element to scroll, so its toolbar can
 *   leave the scroller like every other view's;
 * - Escape leaves a task, the way it leaves a dialog everywhere else.
 */
(function () {
    'use strict';

    /**
     * Give the project overview a single element to scroll.
     *
     * Every other view has one — the board has `#board-container`, the list has
     * `.table-list`, a two-pane view has `.sidebar-content` — so the toolbar can
     * leave the scroller and the scrollbar starts below it. The overview renders six
     * blocks side by side under the toolbar with nothing around them, and CSS cannot
     * wrap what a template did not wrap. Its scrollbar therefore ran the full height
     * of the page, beside the toolbar.
     *
     * Wrapping the blocks here rather than overriding `project_overview/show.php`:
     * a forked template keeps rendering the old set of blocks after an upgrade, and
     * says nothing. This takes whatever the template produced, whatever that becomes.
     *
     * It steps aside on the views the stylesheet already handles, and names them
     * rather than counting blocks: the board replaces its own container on every
     * refresh, which would throw a wrapper away, and a two-pane view would end up
     * with a scrollbar inside a scrollbar.
     */
    function wrapOverviewContent() {
        var main = document.getElementById('main');

        if (!main || main.querySelector('.skin-scroll')) {
            return;
        }

        if (main.querySelector('#board-container') || main.querySelector('.sidebar-container')) {
            return;
        }

        var header = main.querySelector('.project-header');

        if (!header || header.parentNode !== main) {
            return;
        }

        var blocks = [];

        for (var node = header.nextElementSibling; node; node = node.nextElementSibling) {
            blocks.push(node);
        }

        if (blocks.length === 0) {
            return;
        }

        var box = document.createElement('div');
        box.className = 'skin-scroll';
        main.appendChild(box);

        for (var i = 0; i < blocks.length; i++) {
            box.appendChild(blocks[i]);
        }
    }

    /**
     * Escape leaves a task.
     *
     * A task is a full page in Kanboard, not a dialog, so Escape has nothing to close
     * there and does nothing at all — while everywhere else in the interface, and in
     * every other tracker, it is the key that gets you out of what you opened.
     *
     * Two things rule out doing this through Kanboard's own `KB.onKey('Escape', …)`:
     *
     * - its dispatcher stops at the *first* listener whose combination matches, and
     *   Kanboard registers one for Escape at startup. A second one is accepted, stored,
     *   and never called. Nothing reports it.
     * - that first listener closes the modal box synchronously, on this very event. A
     *   listener running after it sees a page with no modal in it, and cannot tell
     *   "there was nothing open" from "a dialog was just closed" — so one press would
     *   close the dialog *and* leave the task.
     *
     * Hence a plain listener, in the *capture* phase, which is the only place that sees
     * the page as it was when the key went down. When it decides to act it stops the
     * event, so Kanboard's listener never runs; when it declines, the event carries on
     * untouched and Kanboard behaves exactly as it always has.
     */

    // The page loaded before this one, in this tab. `document.referrer` cannot answer:
    // the layout sends `<meta name="referrer" content="no-referrer">`, so it is empty on
    // every Kanboard page. sessionStorage is per tab and survives a full page load, which
    // is what a history question needs — read it before overwriting it.
    var previousPage = (function () {
        var key = 'AzimuthSkin.currentPage';

        try {
            var previous = window.sessionStorage.getItem(key);
            window.sessionStorage.setItem(key, window.location.href);
            return previous;
        } catch (e) {
            // Storage refused (private window, storage disabled): no history to trust,
            // and the fallback below is a link that always works.
            return null;
        }
    }());

    // What Kanboard's own Escape is for. None of these is open while a task page is
    // merely being read, and each of them must keep Escape when it is.
    var TRANSIENT_SELECTORS = [
        '#modal-overlay',           // the modal box, and its overlay
        '#dropdown',                // an action menu
        '#suggest-menu',            // @mention and #tag completion
        '#select-dropdown-menu'     // the searchable select
    ];

    function isSomethingOpen() {
        for (var i = 0; i < TRANSIENT_SELECTORS.length; i++) {
            if (document.querySelector(TRANSIENT_SELECTORS[i]) !== null) {
                return true;
            }
        }

        return false;
    }

    // The same test as Kanboard's `KB.utils.isInputField`. A comment box sits in the
    // page itself on a task, not in a dialog: leaving on Escape would throw away what
    // was being typed, with no way back.
    function isTyping(element) {
        return !!element && (
            element.tagName === 'INPUT' ||
            element.tagName === 'SELECT' ||
            element.tagName === 'TEXTAREA' ||
            element.isContentEditable === true
        );
    }

    function leaveTask(e) {
        // 'Esc' is what browsers older than Chrome 51 and Firefox 46 send.
        if ((e.key !== 'Escape' && e.key !== 'Esc') || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
            return;
        }

        // The task page, and nothing else: `#task-view` is set by `task/layout.php`.
        if (document.getElementById('task-view') === null) {
            return;
        }

        if (isTyping(e.target) || isSomethingOpen()) {
            return;
        }

        // Going back is what the key is expected to do: it restores the board's scroll
        // position, and it respects the view the task was opened from — the list as much
        // as the board. It is only trustworthy when the previous page is known to be
        // another Kanboard page of this tab; a task opened in a new tab, or reached
        // straight from an e-mail or a Gitea link, would otherwise leave the application
        // or do nothing at all. The URL is compared because a reload — which is how
        // Kanboard returns from an edit dialog — writes the current page as its own
        // predecessor without adding a history entry.
        var canGoBack = previousPage !== null &&
            previousPage !== window.location.href &&
            window.history.length > 1;

        if (canGoBack) {
            e.preventDefault();
            e.stopPropagation();
            window.history.back();
            return;
        }

        // Otherwise the board of the task's project, by the link the project header
        // already carries — the very one Kanboard's own `v b` follows.
        var boardLink = document.querySelector('a.view-board');

        if (boardLink !== null && boardLink.getAttribute('href')) {
            e.preventDefault();
            e.stopPropagation();
            window.location = boardLink.getAttribute('href');
        }
    }

    window.addEventListener('keydown', leaveTask, true);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapOverviewContent);
    } else {
        wrapOverviewContent();
    }
})();
