/**
 * One thing only: give the project overview a single element to scroll.
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
(function () {
    'use strict';

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapOverviewContent);
    } else {
        wrapOverviewContent();
    }
})();
