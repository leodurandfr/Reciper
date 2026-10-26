/**
 * Prépare le runtime Python embarqué dans l'extension (vendor/pyodide/) :
 * - le cœur Pyodide copié depuis node_modules
 * - les wheels nécessaires à recipe-scrapers, téléchargées une fois puis vérifiées (sha256),
 *   puis précompilées en bytecode (.pyc) : sinon Python recompile ~1000 fichiers à chaque
 *   démarrage, ce qui ralentit fortement le premier scraping
 * - vendor/supported-sites.js : les domaines gérés par la version embarquée de recipe-scrapers,
 *   lus dans recipe_scrapers.SCRAPERS (la liste suit donc toujours la version de la wheel)
 *
 * Le Chrome Web Store interdit le code distant : tout doit être dans le paquet.
 * Lancé automatiquement avant `npm run build` ; les fichiers déjà présents sont réutilisés.
 */

import { createHash } from 'crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { createRequire } from 'module'
import { dirname, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'vendor/pyodide')
const cacheDir = resolve(root, 'vendor/wheels-cache')
const supportedSitesFile = resolve(root, 'vendor/supported-sites.js')
const pyodideDir = dirname(createRequire(import.meta.url).resolve('pyodide/package.json'))
const pyodideVersion = JSON.parse(readFileSync(resolve(pyodideDir, 'package.json'), 'utf-8')).version
const cdnBase = `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`

const CORE_FILES = [
  'pyodide.mjs',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]

// Paquets compilés pour Pyodide (lxml) ou déjà fournis par sa distribution,
// avec leurs dépendances. Versions et sha256 lus dans pyodide-lock.json.
const PYODIDE_PACKAGES = [
  'lxml',
  'beautifulsoup4', 'soupsieve', 'typing-extensions',
  'html5lib', 'six', 'webencodings',
  'pyparsing',
  'requests', 'urllib3', 'certifi', 'idna', 'charset-normalizer',
]

// Wheels pure-Python depuis PyPI (recipe-scrapers et dépendances d'extruct).
// jstyleson n'existe qu'en sdist : il est vendorisé dans python/jstyleson.py.
const PYPI_WHEELS = [
  ['recipe_scrapers-15.13.0-py3-none-any.whl', 'https://files.pythonhosted.org/packages/75/31/36696aff66b5727615210f8f83f6be4f439b362061070fc9b946de20f97e/recipe_scrapers-15.13.0-py3-none-any.whl', 'f67cb8bf655efb3748a0de6116ad69b7df4a5c2a70b71785e82b4ec33312fc63'],
  ['extruct-0.18.0-py2.py3-none-any.whl', 'https://files.pythonhosted.org/packages/33/00/60d3efc09d52a9e8d57b59323d7edb962daba2f1c46b89449a252f3652e7/extruct-0.18.0-py2.py3-none-any.whl', '1e739985da705c3348c7614dc169e7780caf20908338fa5f4c6e48576df6f000'],
  ['html_text-0.7.1-py3-none-any.whl', 'https://files.pythonhosted.org/packages/01/da/694ee4570fb1d9d06a00f1493a248531d347be48a2503e9dd79c595de992/html_text-0.7.1-py3-none-any.whl', 'acf13aa1412e559f84f4617fba419720cb8732861736fe07a8dfdafcbdbb8cad'],
  ['isodate-0.7.2-py3-none-any.whl', 'https://files.pythonhosted.org/packages/15/aa/0aca39a37d3c7eb941ba736ede56d689e7be91cab5d9ca846bde3999eba6/isodate-0.7.2-py3-none-any.whl', '28009937d8031054830160fce6d409ed342816b543597cece116d966c6d99e15'],
  ['lxml_html_clean-0.4.6-py3-none-any.whl', 'https://files.pythonhosted.org/packages/f5/36/4898b5e3951635846ed0e445e042fadf02b7c5e811a9e43da5b3557bc8d2/lxml_html_clean-0.4.6-py3-none-any.whl', 'cc037270ba500a65e7235409dcddcae8ef37300f26dea826b61d917bf0236880'],
  ['mf2py-2.0.2-py3-none-any.whl', 'https://files.pythonhosted.org/packages/5a/b9/487b9ac9541721f02886b225ac15bac3e291b7a59f30dd36502f630cc4d3/mf2py-2.0.2-py3-none-any.whl', 'edc5b433e970e5e9a480e112b2ca5b203299b7c918127501fcb823b5c8fbb905'],
  ['pyrdfa3-3.6.5-py3-none-any.whl', 'https://files.pythonhosted.org/packages/79/9c/ce827ad1262c02cfd377dd75b73010f83010f05fa6db662af950948c0e61/pyrdfa3-3.6.5-py3-none-any.whl', '3c0d22e2949e7b3abd004fff7c7f110faa83a18bec06f590bdab2ef0f1ee3c02'],
  ['rdflib-7.6.0-py3-none-any.whl', 'https://files.pythonhosted.org/packages/10/c2/6604a71269e0c1bd75656d5a001432d16f2cc5b8c057140ec797155c295e/rdflib-7.6.0-py3-none-any.whl', '30c0a3ebf4c0e09215f066be7246794b6492e054e782d7ac2a34c9f70a15e0dd'],
  ['w3lib-2.5.0-py3-none-any.whl', 'https://files.pythonhosted.org/packages/99/bb/e977329315ba4e14f6f6ca0fee7de816a80d161c115a181405bbab92aecf/w3lib-2.5.0-py3-none-any.whl', '136fd5edfe64b53b8579838e2a7e803495bbbe6b69ddfaeed3c29a794b44f6ba'],
]

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function downloadWheel(fileName, url, expectedSha256) {
  const target = resolve(cacheDir, fileName)
  if (existsSync(target) && sha256(readFileSync(target)) === expectedSha256) return

  const response = await fetch(url)
  if (!response.ok) throw new Error(`${fileName}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (sha256(buffer) !== expectedSha256) throw new Error(`${fileName}: sha256 mismatch`)
  writeFileSync(target, buffer)
  console.log(`  downloaded ${fileName}`)
}

/**
 * Ajoute à chaque wheel le bytecode de ses modules (__pycache__/*.cpython-3XX.pyc, en mode
 * « unchecked hash » : Python l'utilise sans vérifier la source). Compilé par Pyodide lui-même
 * pour que le format corresponde exactement à son Python. Retourne cette instance de Pyodide.
 */
async function precompileWheels(fileNames) {
  const { loadPyodide } = await import(pathToFileURL(resolve(outDir, 'pyodide.mjs')).href)
  const pyodide = await loadPyodide({ indexURL: outDir + '/' })
  pyodide.FS.mkdirTree('/wheels/in')
  pyodide.FS.mkdirTree('/wheels/out')
  for (const fileName of fileNames) {
    pyodide.FS.writeFile(`/wheels/in/${fileName}`, readFileSync(resolve(cacheDir, fileName)))
  }
  pyodide.runPython(`
import importlib.util
import os
import zipfile
from importlib._bootstrap_external import _code_to_hash_pyc

for name in os.listdir("/wheels/in"):
    with zipfile.ZipFile(f"/wheels/in/{name}") as src, \\
         zipfile.ZipFile(f"/wheels/out/{name}", "w", zipfile.ZIP_DEFLATED) as dst:
        for info in src.infolist():
            data = src.read(info)
            dst.writestr(info, data)
            if info.filename.endswith(".py"):
                code = compile(data, info.filename, "exec", dont_inherit=True)
                pyc = _code_to_hash_pyc(code, importlib.util.source_hash(data), checked=False)
                dst.writestr(importlib.util.cache_from_source(info.filename), bytes(pyc))
`)
  for (const fileName of fileNames) {
    writeFileSync(resolve(outDir, fileName), pyodide.FS.readFile(`/wheels/out/${fileName}`))
  }
  return pyodide
}

/**
 * Écrit vendor/supported-sites.js : les domaines (sans « www. ») pour lesquels la version
 * embarquée de recipe-scrapers a un scraper dédié. Importé par le service worker.
 */
async function writeSupportedSites(pyodide, fileNames) {
  await pyodide.loadPackage(fileNames.map((w) => resolve(outDir, w)), { messageCallback: () => {} })
  // Dépendance d'extruct vendorisée (voir PYPI_WHEELS)
  pyodide.FS.mkdirTree('/vendored')
  pyodide.FS.writeFile('/vendored/jstyleson.py', readFileSync(resolve(root, 'python/jstyleson.py')))
  const hosts = JSON.parse(pyodide.runPython(`
import json
import sys
sys.path.insert(0, "/vendored")
from recipe_scrapers import SCRAPERS
json.dumps(sorted({host.removeprefix("www.") for host in SCRAPERS}))
`))
  writeFileSync(supportedSitesFile, `// Généré par scripts/vendor-pyodide.mjs depuis recipe_scrapers.SCRAPERS : ne pas modifier.
export const SUPPORTED_SITES = new Set(${JSON.stringify(hosts, null, 2)});
`)
  console.log(`  ${hosts.length} sites supportés par recipe-scrapers`)
}

mkdirSync(outDir, { recursive: true })
mkdirSync(cacheDir, { recursive: true })

for (const file of CORE_FILES) {
  copyFileSync(resolve(pyodideDir, file), resolve(outDir, file))
}

const lock = JSON.parse(readFileSync(resolve(pyodideDir, 'pyodide-lock.json'), 'utf-8'))
const wheels = []

for (const name of PYODIDE_PACKAGES) {
  const pkg = lock.packages[name]
  if (!pkg) throw new Error(`${name} absent de pyodide-lock.json (Pyodide ${pyodideVersion})`)
  await downloadWheel(pkg.file_name, cdnBase + pkg.file_name, pkg.sha256)
  wheels.push(pkg.file_name)
}

for (const [fileName, url, hash] of PYPI_WHEELS) {
  await downloadWheel(fileName, url, hash)
  wheels.push(fileName)
}

// Ne recompiler (et ne relister les sites) que si les wheels ou la version de Pyodide ont changé
const stampFile = resolve(root, 'vendor/precompiled.json')
const stamp = JSON.stringify({
  pyodideVersion,
  // Contenu de ce script : changer la génération (bytecode, liste des sites) relance le travail
  script: sha256(readFileSync(fileURLToPath(import.meta.url))),
  wheels: Object.fromEntries(wheels.map((w) => [w, sha256(readFileSync(resolve(cacheDir, w)))])),
})
const upToDate = existsSync(stampFile)
  && readFileSync(stampFile, 'utf-8') === stamp
  && wheels.every((w) => existsSync(resolve(outDir, w)))
  && existsSync(supportedSitesFile)
if (!upToDate) {
  const pyodide = await precompileWheels(wheels)
  await writeSupportedSites(pyodide, wheels)
  writeFileSync(stampFile, stamp)
}

// Liste lue par pyodide-worker.js pour charger les wheels
writeFileSync(resolve(outDir, 'wheels.json'), JSON.stringify(wheels, null, 2))

console.log(`Pyodide ${pyodideVersion} + ${wheels.length} wheels prêts dans vendor/pyodide/`)
