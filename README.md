# Spiro

A Comment System With [Backend](https://github.com/coffeehat/Spiro_Backend)

<img src="./public/demo.png" width="600px"/>

## Features

* You manage your own comment data
* Two levels of comment
* Email notification when receive reply
* Support both visitor and registered memeber

## Install

### Frontend

Spiro is packed in `spiro.js` and `style.css`, you need to import those two files as below.

``` html
<!-- 1. Import CSS -->
<link rel="stylesheet" href="style.css" />

<!-- 2. Create placeholder for Spiro -->
<div id="app"></div>

<!-- 3. Mount Spiro -->
<script type="module">
  import { SpiroConfig, mountSpiro, updateReadCount } from "./spiro.js";
  // You need to give server_address and the current page uuid at least
  SpiroConfig.server_addr = "http://127.0.0.1:5000";
  SpiroConfig.article_uuid = "0";
  mountSpiro('app');
</script>
```

You can find a complete but small demo from file `demo.html` 

### BackEnd

Refer to [Spiro Backend](https://github.com/coffeehat/Spiro_Backend) to see how to implement backend

## License

MIT License