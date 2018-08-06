# Wpteens

Before you begin working, make sure to either:
```
git pull origin master
```
or:
```
git fetch --all
git reset --hard origin/master
```

Make sure to push changes when done editing:
```
git add .
git commit -m "COMMIT MESSAGE"
git push -u origin master
```


## File Structure:
```
├── dev/
│   ├── app.css
│   ├── app.js  
│   ├── index.html
│   ├── about.html
│   └── ...
├── dist/
│   ├── app.min.css
│   ├── app.min.js  
│   ├── index.html
│   ├── about.html
│   └── ...
│
├── src/
│   ├── img/
│   ├── _includes/
│   ├── _layouts/
│   ├── pages/
│   ├── _sass/
│   │   ├── _base/
│   │   ├── _layout/
│   │   ├── _modules/  
│   │   ├── _states/   
│   │   └── _imports.scss
│   │
│   ├── ...
│   ├── CNAME
│   ├── favicon.ico
│   ├── robots.txt  
│   └── sitemap.xml
```

## Technologies:
This project uses technologies such as:
- NodeJS
- Yarn for package management
- GulpJS for automation
- Nunjucks for templating
- Sass for css

## Installing
To host this project, ensure that [git](https://git-scm.com/downloads), [NodeJS](https://nodejs.org/en/download/), and the [Yarn package manager](https://yarnpkg.com/en/docs/install) are installed.

Next, run:
```
cd path/to/directory
git clone https://gitlab.com/wpyouth10601/website.git
yarn install
```

When editing, use the following GulpJS commands:
```
gulp watch # start development, this will compile sass and includes live browser reload
gulp prod # will run production mode, including minification and production additionals
```
