const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packagesDir = path.join(__dirname, '..', 'packages');
const packageDirs = fs
  .readdirSync(packagesDir)
  .filter((name) => fs.statSync(path.join(packagesDir, name)).isDirectory());

const packages = packageDirs
  .map((dir) => {
    const pkgJsonPath = path.join(packagesDir, dir, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    return {
      name: pkgJson.name,
      deps: Object.assign({}, pkgJson.dependencies, pkgJson.devDependencies),
    };
  })
  .filter((pkg) => pkg.name !== '@noxigui/playground');

const packageNames = new Set(packages.map((p) => p.name));

// Build dependency graph and perform topological sort
const graph = new Map();
for (const pkg of packages) {
  let deps = Object.keys(pkg.deps || {}).filter((dep) => packageNames.has(dep));
  // runtime can import parser for optional features but doesn't require it
  // to be built beforehand. Avoid including this edge in the build graph to
  // prevent a circular dependency during topological sorting (parser -> runtime
  // -> parser).
  if (pkg.name === '@noxigui/runtime') {
    deps = deps.filter((dep) => dep !== '@noxigui/parser');
  }
  graph.set(pkg.name, deps);
}

const visited = new Set();
const order = [];
function visit(name, stack = new Set()) {
  if (visited.has(name)) return;
  if (stack.has(name)) throw new Error('Circular dependency detected');
  stack.add(name);
  const deps = graph.get(name) || [];
  for (const dep of deps) {
    if (graph.has(dep)) visit(dep, stack);
  }
  stack.delete(name);
  visited.add(name);
  order.push(name);
}

for (const name of graph.keys()) {
  visit(name);
}

for (const name of order) {
  console.log(`Building ${name}...`);
  execSync(`pnpm -F ${name} build`, { stdio: 'inherit' });
}
