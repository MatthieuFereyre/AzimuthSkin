<?php
/**
 * Rendered at the very end of <head>, after skin.css.
 *
 * The dark palette is a separate sheet rather than a media query: Kanboard picks
 * its theme from the user profile, not from the system preference, and says so
 * nowhere in the markup. Reading it here is the only way to know.
 */
?>
<?php if ($this->user->getTheme() === 'dark'): ?>
    <?= $this->asset->css('plugins/AzimuthSkin/Assets/theme-dark.css') ?>
<?php endif ?>
