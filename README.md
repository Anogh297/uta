# Project Uta

A small Sveltekit project to download songs from spotify with ease

## Features

- Light/dark mode support
- Downloads several songs at once and saves them in a zip
- Fast download speed thanks to yt-dlp
- Windows/linux compatible

## Demo

![Uta](https://github.com/Anogh297/uta/blob/master/content/demo.gif?raw=true)

## Run Locally

Clone the project

```bash
  git clone https://github.com/Anogh297/uta
```

Go to the project directory

```bash
  cd uta
```

Install dependencies (see below) then start the server

```bash
  npm run dev
```

## Installation

To run the project, you need to have a spotify api key. Click [here](http://localhost:5173/?code=AQCNPVR31LMJRnChN-oDg1XUrVLs4bvXkIjVQojsqvL504dxNX-EMEqy4uSGfNX0DsKpasZ58XOLIH5g12YQe7nht6kgpbD7XS0HI8w6G8KJIj6lkXG8tM583oJo4SQAijnNCvdkZHN5_IwCYe6c_gccjojuKv29URk) to create one. _You can set the redirect url to just `localhost`._ After setting up, run these commands in order

```bash
# Install node packages, you can use npm, yarn or pnpm
npm install

# Configure spotify api
node auth
```

## Deployment

To build and deploy this project run

```bash
# Compilation
npm run build

# Start the server
npm start
```

The project will be compiled to `build` folder

## API Reference

#### Get track/playlist/album information

```http
  GET /api/track
```

| Parameter | Type     | Description               |
| :-------- | :------- | :------------------------ |
| `url`     | `string` | **Required**. Spotify url |

#### Get download stream

```http
  GET /api/download
```

| Parameter | Type     | Description               |
| :-------- | :------- | :------------------------ |
| `url`     | `string` | **Required**. Spotify url |

## Roadmap

- Add Youtube support

- Append metadata to the downloaded m4a files

## Support

For support, email me at contact@zafirhasan.me or feel free to reach out to me on [Discord](https://discordapp.com/users/477845082440204288)!

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgements

- [yt-dlp-wrap](https://github.com/foxesdocode/yt-dlp-wrap)
