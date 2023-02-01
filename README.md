# Dependabot Unifier

Are you tired of having to handle several Dependabot PRs one by one?

With this script you can fetch dependabot PRs from a remote repository (based on a local directory) and update the packages related to them locally!

After this local update, you can run your tests and then open a PR including all dependabot updates at once.

When this new PR is merged, dependabot will automatically detect these packages are already updated in the repository and close the PRs it created.

## Dependencies

You need to have these installed to be able to use this script:

- git
- [Github CLI](https://cli.github.com/)
- npm
- Node.js >= v16.13.1 (You can use [nvm](https://github.com/nvm-sh/nvm) for that)

You also need to be able to access this repository using the Github CLI tool, of course.

## Usage

Install the dependencies

```bash
npm i
```

Run the script informing the directory in your computer where the repository is located:

```bash
npm start /path/to/my/local-repository
```
