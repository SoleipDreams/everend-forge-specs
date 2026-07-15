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

## Compatibility

Tools must preserve unknown frontmatter objects. A v0.1 reader may treat nested objects as unknown project-specific properties while continuing to read core fields. `.everend/taxonomy.yaml` remains the v0.1 taxonomy manifest and is not removed by v0.2.

Version 2.0 WorldNotion property configurations are legacy input. Upgrading to 3.0 requires explicit user confirmation before rewriting note frontmatter.
