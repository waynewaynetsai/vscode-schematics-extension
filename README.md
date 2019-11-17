# Schematics Extension

Handling schematics cli commands via VSCode Graphical User Interface. Inspired by [Angular Schematics](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics).  

Schematics Extension only depends on Schematics CLI to generate boilerplate code and file, so you can use it without angular project and node_modules to generate any code boilerplate everywhere.

![](https://i.imgur.com/RdNF1gc.gif)

## Guide

####  1. Extension Settings: 

Setting node_modules schematics projectname or your schematics project path in vscode settings.

 ```code```->```preference``` -> ```settings``` -> ```user``` -> ```extensions``` -> ```Schematics Extension```

![](https://i.imgur.com/4d6ZP1B.png)

Settings for node_modules can only use your schematics at nodejs project or other project with node_modules.

> NOTICE: If you want to use schematics in your node_modules, make sure you also link you schematics to your node_modules(try to use ```npm link``` command), or just install published schematics in your node_modules. 

####  2. Getting start Schematics via GUI: 

You can start use schematics cli via three places:

1. Command Palette: Generate schematic file:

    - open command palette: 
    
    - -   ```cmd + shift + p``` 
    
    -  select ```schematics extension: execute via command palette```

2. Files Explorer menu: 

    - open menu: 
    
        Right-clicking files in explorer
        ![](https://i.imgur.com/7huk0fq.png)
    - select ```schematics extension: execute schematics```

3. Schematics' Treeview 

    - open Treeview: 
       
       Select Activity bar's icon on the left

       ![](https://i.imgur.com/ytpgLSk.png)
    - select your schematics template.

## Requirements

### VS Code

Schematics Extension requires Visual Studio Code version >= 1.39.

### Schematics cli
install your schematics cli first.

```npm i -g schematics``` 
## Details

Schematics Extension will be auto actived in node dependened project (with package.json).

It will also be actived in language file
as follow:

- typescript
- javascript
- java
- dart
- python
- golang
- kotlin
- swift
- csharp

If your extension is not actived, you can manual trigger it by lanunching our custom command in palatte 

 ```schematics extension: execute schematics```

or by right-clicking your file under explorer then select our custom command item.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0 - Beta (2019/11/17)

Hello World Schematics Extension!

-----------------------------------------------------------------------------------------------------------
