# Invalid v0.1 Fixtures

These files are deliberately invalid. They exist so future validators can test expected failures without mutating the canonical demo vault.

- `missing-id.md`: entity frontmatter missing required `id`.
- `invalid-childrenids.md`: `childrenIds` is not an array.
- `invalid-taxonomy.yaml`: taxonomy property uses an unsupported property type.
- `invalid-runtime-package.json`: runtime package uses an unsupported `specVersion`.
- `invalid-validation-report.yaml`: validation finding is missing required `code`.
- `invalid-canon-change-set.json`: canon change proposal is missing its target.
- `invalid-compendium-config.yaml`: invalid color, empty publication status list, and unsupported narrative mode.
