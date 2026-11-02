import json
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OLD = ROOT.parent / 'img'
OUT = ROOT / 'src' / 'assets' / 'gallery'

PHOTOS = [
    ('boda-1', 'weddings', 'Mesa de boda con aro floral y tortas con flores azules', 'Wedding table with a floral hoop and cakes with blue flowers', True),
    ('boda-3', 'weddings', 'Torta de boda de varios pisos con cisnes y flores azules', 'Multi-tier wedding cake with swans and blue flowers', True),
    ('boda-4', 'weddings', 'Torta morada con flores y mariposas', 'Purple cake with flowers and butterflies', False),
    ('boda-5', 'weddings', 'Mesa de postres de boda con torres de cupcakes y tortas', 'Wedding dessert table with cupcake towers and cakes', True),
    ('boda-6', 'weddings', 'Torta de aniversario con rosas de crema y topper de pareja', 'Anniversary cake with cream roses and a couple topper', False),
    ('T-19', 'cakes', 'Torta de capas con chocolate, crema y fresas', 'Layered cake with chocolate, cream and strawberries', True),
    ('T-9', 'cakes', 'Torta temática del Capitán América', 'Captain America themed cake', True),
    ('T-5', 'cakes', 'Torta de dos pisos con frutos rojos', 'Two-tier cake with berries', True),
    ('T-14', 'cakes', 'Torta de bautizo azul con zapatitos', 'Blue baptism cake with little shoes', True),
    ('T-7', 'cakes', 'Torta temática de safari con león y jirafa', 'Safari-themed cake with a lion and a giraffe', False),
    ('T-8', 'cakes', 'Torta de chocolate con crema y cerezas', 'Chocolate cake with cream and cherries', False),
    ('T-11', 'cakes', 'Torta de graduación con birrete y calculadora', 'Graduation cake with a cap and a calculator', False),
    ('T-13', 'cakes', 'Torre de mini tortas azules con tema de sirenita', 'Tower of blue mini cakes with a mermaid theme', False),
    ('T-15', 'cakes', 'Torta rosada con topper de feliz cumpleaños', 'Pink cake with a happy birthday topper', False),
    ('T-16', 'cakes', 'Torta de cumpleaños de Winnie the Pooh', 'Winnie the Pooh birthday cake', False),
    ('T-17', 'cakes', 'Torta de cumpleaños con dibujo de una niña', 'Birthday cake with a drawing of a girl', False),
    ('T-21', 'cakes', 'Mesa de cumpleaños con tortas de Winnie the Pooh', 'Birthday table with Winnie the Pooh cakes', False),
    ('T-20', 'cakes', 'Torta con cake pops en forma de ojos', 'Cake with eye-shaped cake pops', False),
    ('T-23', 'cakes', 'Torta con forma de ojo', 'Eyeball-shaped cake', False),
    ('T-2', 'cakes', 'Torta de corazón con dibujo de pareja y mensaje de aniversario', 'Heart-shaped cake with a couple drawing and an anniversary message', False),
    ('T-3', 'cakes', 'Torta de corazón con ositos y corazones rojos', 'Heart cake with little bears and red hearts', False),
    ('T-4', 'cakes', 'Torta blanca con dibujo y mensaje de cumpleaños', 'White cake with a drawing and birthday message', False),
    ('T-12', 'cakes', 'Torta decorada con el logo de una institución', "Cake decorated with an institution's logo", False),
    ('T-22', 'cakes', 'Torta rectangular de aniversario con logo', 'Rectangular anniversary cake with a logo', False),
    ('T-1', 'cakes', 'Torta en forma de corazón con rosas de crema rosada', 'Heart-shaped cake with pink cream roses', False),
    ('co-1', 'cocktail', 'Bandejas de bocaditos dulces y salados', 'Trays of sweet and savory bites', False),
    ('co-2', 'cocktail', 'Bandeja de mini hamburguesas', 'Tray of mini burgers', False),
    ('co-3', 'cocktail', 'Mini hamburguesas y torta en una mesa de evento', 'Mini burgers and a cake on an event table', False),
    ('rv-4', 'cocktail', 'Caja de cupcakes con detalle decorado', 'Box of cupcakes with a decorated treat', False),
    ('rv-2', 'cocktail', 'Mesa de postres con torta Cioccolato, donas y pasteles', 'Dessert table with a Cioccolato cake, donuts and pastries', False),
    ('c-1', 'buffet', 'Plato servido con arroz, ensalada y carne', 'Plated dish with rice, salad and meat', False),
    ('c-2', 'buffet', 'Plato servido con papa y salsa', 'Plated dish with potato and sauce', False),
    ('c-3', 'buffet', 'Platos servidos de pollo, maíz y ensalada', 'Plated dishes with chicken, corn and salad', True),
]

CROPS = {'T-1': (130, 50, 630, 470)}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for photo_id, category, es, en, featured in PHOTOS:
        source = next(OLD.glob(f'{photo_id}.*'))
        name = f"{photo_id.lower()}{'.jpg' if photo_id in CROPS else source.suffix.lower()}"
        target = OUT / name
        if photo_id in CROPS:
            Image.open(source).convert('RGB').crop(CROPS[photo_id]).save(target, quality=90)
        else:
            shutil.copy2(source, target)
        width, height = Image.open(target).size
        manifest.append({'id': photo_id.lower(), 'file': name, 'category': category, 'width': width, 'height': height, 'es': es, 'en': en, 'featured': featured})
    (ROOT / 'src' / 'data').mkdir(parents=True, exist_ok=True)
    (ROOT / 'src' / 'data' / 'gallery.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(len(manifest), 'fotos')


if __name__ == '__main__':
    main()
