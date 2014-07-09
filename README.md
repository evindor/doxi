Doxi
====

Doxi is intended to help you build a great single page documentation for your API.
To accomplish this mission Doxi introduces custom JSDoc tags:

- `@group` is used to assemble comments from separate files into a single logical group, e.g. "Events" or "Model".
  Example: `@group Events`.
- `@grouptext` is used to write a description text for your group which will be rendered before any items in that group. You can use markdown there.
  Example: `@grouptext List of **application events**.`
- `@api` is used to separate your internal JSDoc from the one you want to expose to public. Only `@api public` comments will be processed.
  Example: `@api public`.
