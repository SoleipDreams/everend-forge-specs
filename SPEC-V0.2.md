# Everend Spec v0.2

Everend Spec v0.2 extends the v0.1 Markdown vault contract with a portable, hierarchical property configuration. All v0.1 entity identity, hierarchy, wikilink, runtime-package, and validation-report rules remain valid.

## Properties configuration

A vault may include `.everend/properties.json`. Version `3.0` is the portable hierarchical format defined by `schemas/v0.2/properties-config.schema.json`.

Property IDs are stable and globally unique within the configuration. Labels may change without changing storage keys. Core entity fields (`id`, `type`, `name`, and `status`) remain at the frontmatter root.

~~~json
{
  "version": "3.0",
  "customFields": {
    "definitions": [
      {
        "id": "identity",
        "label": "Identity",
        "type": "group",
        "appliesTo": ["character"],
        "children": [
          { "id": "role", "label": "Role", "type": "select", "options": [{ "value": "protagonist", "label": "Protagonist" }] }
        ]
      }
    ]
  }
}
~~~

## Nested frontmatter

A `group` is an object container. Every child value is stored below the stable group ID. Groups may contain other groups. Empty groups are omitted.

~~~yaml
---
id: mara-voss
type: character
name: Mara Voss
status: canon
identity:
  role: protagonist
  affiliation: glass-cartographers
---
~~~

Leaf properties that are not children of a group remain top-level. A group never has a scalar value.

## Type scopes

`appliesTo` lists entity type IDs where a property is available. A root property without `appliesTo` applies to every type. A child without `appliesTo` inherits its parent scope. An explicit child scope must be a subset of the effective parent scope.

Changing scope affects presentation and validation only. Tools must not delete hidden values.

## Dynamic visibility

`visibleWhen` maps stable property IDs to accepted values. Conditions for different properties use AND semantics. Multiple accepted values for one property use OR semantics. Dependencies resolve through the configured property tree, including nested YAML paths.

The entity `type` field must not appear in `visibleWhen`; type visibility uses `appliesTo`.

## Type presentation

An entity type may optionally declare visual roles under `presentation`. `portraitPropertyId` and
`coverPropertyId` reference stable leaf property IDs of type `image` that apply to that entity
type. A referenced image property may be nested in a group; its YAML storage path remains the
property tree path. The same property may serve both roles. These roles control presentation only:
they do not create fields, rewrite notes, or delete values when disabled.

~~~json
{
  "id": "character",
  "label": "Character",
  "presentation": {
    "portraitPropertyId": "portrait",
    "coverPropertyId": "cover"
  }
}
~~~

## Note variants

An entity may define named variants in its own frontmatter without duplicating the Markdown
file. `variants.base` is always available; it may have a custom `label`, but has no overrides
and cannot be removed. Other variant IDs are stable identifiers and contain a non-empty `label`
and optional `overrides` object. Override values use the same root keys and nested YAML paths as
the entity's ordinary frontmatter. `id`, `type`, and `variants` are structural and must not be
overridden.

~~~yaml
---
id: mara-voss
type: character
name: Mara Voss
identity:
  profile:
    age: 34
variants:
  base:
    label: Canon
  mara-adulta:
    label: Mara adulta
    overrides:
      name: Mara Voss, cartógrafa mayor
      identity:
        profile:
          age: 62
---
~~~

Variant-only prose remains in the same Markdown body. A block begins with
`<!-- everend:variant id="variant-id" -->` and ends with `<!-- /everend:variant -->`.
Unmarked Markdown is shared. Tools that do not support variants preserve these standard HTML
comments and display the enclosed prose as ordinary Markdown.

Variant selection is a local application preference; it is never written to the shared vault.
Tools must preserve unknown variant overrides and treat malformed or unknown variant blocks as
visible content rather than discarding them.

## Compatibility

Tools must preserve unknown frontmatter objects. A v0.1 reader may treat nested objects as unknown project-specific properties while continuing to read core fields. `.everend/taxonomy.yaml` remains the v0.1 taxonomy manifest and is not removed by v0.2.

## Runtime logic

Runtime package v0.2 defines portable logic subjects, predicates, recursive expressions, effects,
rules, and logic moments. Canon and local entities are referenced by stable ID; effects update a
runtime state overlay and never imply a write to the source vault. A transition with role `flow`
is structural and cannot carry logic. A `route` may carry a condition, effects, explicit order,
and a final fallback. Engine adapters must reject unsupported predicates or effects explicitly
instead of dropping them during import.

Version 2.0 WorldNotion property configurations are legacy input. Upgrading to 3.0 requires explicit user confirmation before rewriting note frontmatter.
