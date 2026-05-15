/**
 * Enqueue RTF financial assets.
 * Add this to your theme's functions.php
 */
function rtf_enqueue_financial_assets() {
    wp_enqueue_style(
        'rtf-finance',
        get_template_directory_uri() . '/css/rtf-finance.css',
        [],
        '1.0'
    );

    wp_enqueue_script(
        'rtf-finance',
        get_template_directory_uri() . '/js/rtf-finance.js',
        [],
        '1.0',
        true
    );

    wp_localize_script('rtf-finance', 'RTFConfig', [
        'apiBase' => defined('RTF_API_BASE') ? RTF_API_BASE : 'https://api.yoursite.com',
    ]);
}
add_action('wp_enqueue_scripts', 'rtf_enqueue_financial_assets');
