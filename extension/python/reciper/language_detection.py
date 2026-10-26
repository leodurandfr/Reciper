"""Language detection based on recipe website domain."""


def get_language_from_domain(host: str) -> str:
    """
    Detect language from recipe website domain.

    Args:
        host: Domain name (e.g., "marmiton.org")

    Returns:
        Language code: "fr", "en", "de", "es", "it"

    Examples:
        >>> get_language_from_domain("marmiton.org")
        "fr"
        >>> get_language_from_domain("chefkoch.de")
        "de"
        >>> get_language_from_domain("unknown.com")
        "en"
    """
    DOMAIN_LANGUAGE_MAP = {
        # French sites
        'marmiton.org': 'fr',
        '750g.com': 'fr',
        'cuisineaz.com': 'fr',
        'recettes.qwant.com': 'fr',
        'ptitchef.com': 'fr',
        'cuisine-etudiant.fr': 'fr',

        # German sites
        'chefkoch.de': 'de',
        'rezeptwelt.de': 'de',
        'kochbar.de': 'de',
        'lecker.de': 'de',

        # Spanish sites
        'recetasgratis.net': 'es',
        'directoalpaladar.com': 'es',
        'recetasderechupete.com': 'es',

        # Italian sites
        'giallozafferano.it': 'it',
        'cookaround.com': 'it',
        'fattoincasadabenedetta.it': 'it',

        # English sites
        'allrecipes.com': 'en',
        'foodnetwork.com': 'en',
        'bbcgoodfood.com': 'en',
    }

    # Direct match
    if host in DOMAIN_LANGUAGE_MAP:
        return DOMAIN_LANGUAGE_MAP[host]

    # Fallback to TLD
    if host.endswith('.fr'):
        return 'fr'
    elif host.endswith('.de'):
        return 'de'
    elif host.endswith('.es'):
        return 'es'
    elif host.endswith('.it'):
        return 'it'

    # Default to English
    return 'en'
