import fsp from 'fs-promise'
import { createGist } from './helpers/create-gist'
import { urlShortener } from './helpers/url-shortener'
import chalk from 'chalk'
import Inliner from 'inliner'



const printStatus = async (status) => {
  process.stdout.write(`◩         status: ${status}\n`)
}

const getInlinedFile = async (fileName) => {
  const options = {
    'images': false,
    'compressJS': true,
    'collapseWhitespace': false,
    'compressCSS': true,
    'preserveComments': true,
  }

  return new Promise(( resolve, reject ) => {

    return new Inliner(fileName, options, (error, html) => {
      if (error) reject(error)
      else resolve(html)
    }).on('progress', printStatus)

  })
}

export const deploy = async (fileName = 'index.html') => {
  let fileExists, inlinedHTML, rawGistURL, shortenedUrl
  process.stdout.write(chalk.green(`◩         lagom: deploy\n`))

  try {
    fileExists = await fsp.exists(`./${fileName}`)
    if (!fileExists) throw new Error(`${fileName} doesn't exist`)

    inlinedHTML = await getInlinedFile(`./${fileName}`)

    printStatus('creating gist')

    rawGistURL = await createGist(inlinedHTML)

    printStatus('shortening url')

    try {
      shortenedUrl = await urlShortener(rawGistURL)
      process.stdout.write(chalk.green(`◩         deployed: http://lagom.hook.io/?c=${shortenedUrl}\n`))
    }

    catch(e) {
      let hash1 = rawGistURL.split('/')[4]
      let hash2 = rawGistURL.split('/')[6]

      process.stdout.write(chalk.red(  `◩         error: couldn't shorten url, fallbacking to regular full url.\n`))
      process.stdout.write(chalk.green(`◩         deployed: http://lagom.hook.io/?h1=${hash1}&h2=${hash2}\n`))
    }



  }

  catch(e) {
    process.stdout.write(chalk.red(`◩         error: ${e.message}\n`))
  }
}
