<?php

namespace Kanboard\Plugin\AzimuthSkin;

use Kanboard\Core\Plugin\Base;

/**
 * Azimuth skin for Kanboard.
 *
 * Two stylesheets are attached, and the split is not cosmetic:
 *
 * - `skin.css` carries the whole design (structure, radii, fonts) plus the light
 *   palette, and is attached to `template:layout:css`. Kanboard renders that hook
 *   after its own theme sheet, so every declaration lands on top without a
 *   specificity fight.
 * - `theme-dark.css` only redefines the colour tokens, and is attached to
 *   `template:layout:head` because that hook is rendered by a template, which is
 *   the only place where the user's chosen theme can be read.
 * - `skin.js` does one thing the stylesheet cannot: it gives the project
 *   overview a single element to scroll, so its toolbar can leave the scroller
 *   like everywhere else. See the file for why it is not a template override.
 *
 * Nothing in the served HTML says which theme is active: light and dark differ by
 * the href of one stylesheet and by nothing else, so plain CSS cannot branch on it.
 * Hence the second hook. If it ever stops firing, the light palette still applies
 * and the interface stays legible instead of collapsing.
 *
 * The template reference below keeps its exact case on purpose: Kanboard resolves
 * `Name:template` through `ucfirst($name)`, so a lowercase reference would look for
 * a `Azimuthskin` folder that does not exist.
 */
class Plugin extends Base
{
    public function initialize()
    {
        $this->hook->on('template:layout:css', array('template' => 'plugins/AzimuthSkin/Assets/skin.css'));
        $this->hook->on('template:layout:js', array('template' => 'plugins/AzimuthSkin/Assets/skin.js'));
        $this->template->hook->attach('template:layout:head', 'AzimuthSkin:layout/head');
    }

    public function getPluginName()
    {
        return 'AzimuthSkin';
    }

    public function getPluginDescription()
    {
        return t('A calm, high-contrast skin for both themes. Card colours become readable instead of decorative, task text gets a real typographic scale, and the toolbar stays on screen while the content scrolls. Every colour pair is checked against WCAG AA.');
    }

    public function getPluginAuthor()
    {
        return 'Matthieu Fereyre';
    }

    public function getPluginVersion()
    {
        return '1.0.3';
    }

    public function getPluginHomepage()
    {
        return 'https://github.com/MatthieuFereyre/AzimuthSkin';
    }

    /**
     * Themes arrived in Kanboard 1.2.29; `theme-dark.css` and the profile lookup
     * that picks it have nothing to hang on before that. Developed and verified
     * against 1.2.53.
     */
    public function getCompatibleVersion()
    {
        return '>=1.2.29';
    }
}
