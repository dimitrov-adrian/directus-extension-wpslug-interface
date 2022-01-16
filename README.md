# WP Slug Interface

WordPress alike slug/permalink interface

![](https://raw.githubusercontent.com/dimitrov-adrian/directus-extension-wpslug-interface/main/screenshot.png)

## Installation

In your Directus installation root

```bash
npm install directus-extension-wpslug-interface
```

Restart directus

## How to use

1. Create new standard field with String type
2. For interface select **Slug**

## FAQ

### What does the update "Create" and "Update" options do?

Simply these options enables/disables the automatic update based on content change.

- Having "On Create" will enable automattic updating when creating new item.
- Having "On Update" will enable automattic updating when editing existing item.

It's possible to have both, one or none, depending of your needs.

### There is magic wand appearing

The magic stick button appears when the automatic updates are disabled, but there is content change so the field is
differing from the template. When clicked, the automatic update will be executed.

### Does this works when performing changes throught the API?

No, this is just an interface. It works only on Directus App
