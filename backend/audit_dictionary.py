#!/usr/bin/env python3
"""
Script d'audit du dictionnaire FR_TO_EN.

Identifie les entrées potentiellement problématiques :
- Mots courts (< 4 caractères) = souvent ambigus
- Adjectifs courants (rouge, vert, blanc, etc.)
- Mots génériques (bouillon, vinaigre, etc.)
"""

from app.data.translations.fr_to_en import FR_TO_EN

# Catégories suspectées
POTENTIAL_MODIFIERS = [
    'blanc', 'blanche', 'rouge', 'vert', 'verte', 'jaune', 'noir', 'noire', 'rose',
    'douce', 'doux', 'salé', 'salée', 'sucré', 'sucrée', 'amer', 'amère',
    'frais', 'fraîche', 'fraiche', 'sec', 'sèche', 'seche',
    'gros', 'grosse', 'petit', 'petite', 'grand', 'grande',
]

POTENTIAL_CUTS = [
    'filet', 'filets', 'cuisse', 'cuisses', 'aile', 'ailes',
    'côtelette', 'côtelettes', 'cotelette', 'cotelettes',
    'morceau', 'morceaux', 'tranche', 'tranches', 'dé', 'dés', 'cube', 'cubes',
    'entrecôte', 'entrecote', 'pavé', 'pave', 'escalope', 'escalopes',
]

POTENTIAL_PREPARATIONS = [
    'fumé', 'fumée', 'fume', 'fumee',
    'séché', 'séchée', 'sèche', 'seche', 'sechée', 'sechee',
    'haché', 'hachée', 'hache', 'hachee',
    'moulu', 'moulue',
    'cuit', 'cuite', 'cru', 'crue', 'mariné', 'marinée', 'marine', 'marinee',
    'râpé', 'râpée', 'rape', 'rapee',
    'émincé', 'émincée', 'emince', 'emincee',
    'concassé', 'concassée', 'concasse', 'concassee',
]

POTENTIAL_QUANTITIES = [
    'entier', 'entière', 'entiere', 'demi', 'demie', 'quart', 'pincée', 'pincee',
]

# Mots courts autorisés (ingrédients réels)
ALLOWED_SHORT_WORDS = [
    'ail', 'sel', 'riz', 'thé', 'the', 'thym', 'orge', 'soja', 'tofu',
    'oeuf', 'oeufs', 'pain', 'lait', 'miel', 'maïs', 'mais',
]

def audit_dictionary():
    print("=" * 70)
    print("AUDIT DU DICTIONNAIRE FR_TO_EN")
    print("=" * 70)

    # Collecter les entrées suspectes
    suspects = {
        'Modifiers (couleurs, qualificatifs)': [],
        'Coupes (parties)': [],
        'Préparations (méthodes)': [],
        'Quantités': [],
        'Mots courts (< 4 lettres)': [],
    }

    for fr, en in FR_TO_EN.items():
        if fr in POTENTIAL_MODIFIERS:
            suspects['Modifiers (couleurs, qualificatifs)'].append((fr, en))
        if fr in POTENTIAL_CUTS:
            suspects['Coupes (parties)'].append((fr, en))
        if fr in POTENTIAL_PREPARATIONS:
            suspects['Préparations (méthodes)'].append((fr, en))
        if fr in POTENTIAL_QUANTITIES:
            suspects['Quantités'].append((fr, en))
        if len(fr) < 4 and fr not in ALLOWED_SHORT_WORDS:
            suspects['Mots courts (< 4 lettres)'].append((fr, en))

    # Afficher les résultats
    for category, items in suspects.items():
        if items:
            print(f"\n{category} ({len(items)} entrées):")
            for fr, en in sorted(items):
                print(f"  ❌ '{fr}': '{en}'")

    # Statistiques
    total_suspects = sum(len(items) for items in suspects.values())
    unique_suspects = len(set(fr for items in suspects.values() for fr, _ in items))
    print(f"\n{'=' * 70}")
    print(f"📊 Total d'occurrences suspectes : {total_suspects}")
    print(f"📊 Entrées uniques suspectes : {unique_suspects} / {len(FR_TO_EN)}")
    print(f"📊 Pourcentage : {unique_suspects/len(FR_TO_EN)*100:.1f}%")
    print("=" * 70)

    return suspects

if __name__ == "__main__":
    audit_dictionary()
