# Canon Change Sets

A Canon Change Set is a portable, reviewable proposal to alter a WorldNotion entity. It is stored under `.everend/changes/{id}.json`, so vault scanners ignore it as app metadata.

The entity Markdown file remains Canon until a user applies a change deliberately. A change set contains the target stable ID and path, an immutable base snapshot, proposed content, an optional line diff, state, revision, and timestamps.

Supported states are `draft`, `proposed`, `conflicted`, `applied`, and `dismissed`. Apps must not write a target automatically. Before applying, they compare the target file's modification marker with `base.modifiedMs`; a mismatch becomes `conflicted` and requires user review.

Use [../schemas/v0.1/canon-change-set.schema.json](../schemas/v0.1/canon-change-set.schema.json) and [../examples/canon-change-set.json](../examples/canon-change-set.json) as the v0.1 contract.
