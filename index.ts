import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

interface LibAndVersion {
  lib: string;
  currentVersion: string;
  newVersion: string;
}

class DependabotUnifier {

  private path: string;

  public constructor() {
    if (!process.argv[2]) {
      console.error('Please provide a path to the git repository!');
      return;
    }
    this.path = process.argv[2];
    this.init();
  }

  private async init() {
    try {
      await this.checkDependencies(['gh', 'git', 'npm']);
      const repo = await this.getGitRepo();
      const dependabotPRs = await this.getDependabotPRs(repo);
      const libsAndVersions = this.getLibsAndNewVersions(dependabotPRs);
      await this.npmUpdate(libsAndVersions);
      console.log('\nDone! Now you can start the project and run the tests!');
      console.log('\nIf everything is ok, commit the changes and open a pull request!');
    } catch (err) {
      console.error(err.message);
    }
  }

  private async checkDependencies(commands: string[]) {
    for (const command of commands) {
      try {
        await execAsync(`which ${command}`);
      } catch (err) {
        throw new Error(`Command ${command} not found!`);
      }
    }
  }

  private async getGitRepo() {
    await execAsync(`cd ${this.path} && git rev-parse --is-inside-work-tree`);
    const repo = await execAsync(`cd ${this.path} && git remote -v`);
    if (!repo.stdout.trim()) {
      throw new Error('Remote repository not found');
    }

    return this.getRepoOwnerAndName(repo.stdout);
  }

  private async getRepoOwnerAndName(gitRemoteOutput: string) {
    return gitRemoteOutput.split(' ')[0].split('\t')[1].split(':')[1].split('.')[0];
  }

  private async getDependabotPRs(repoOwnerAndName: string) {
    const dependabotPRs = await execAsync(
      `cd ${this.path} && gh pr list --repo ${repoOwnerAndName} --search "dependabot"`
    );
    if (!dependabotPRs.stdout.trim()) {
      throw new Error('No dependabot PRs found!');
    }
    const prs = dependabotPRs.stdout.split('\n').filter(pr => pr !== '')
    console.log(`Found ${prs.length} dependabot PRs!`);
    console.log('Updating libs ...\n');
    return prs;
  }

  private getLibsAndNewVersions(prList: string[]): LibAndVersion[] {
    return prList.map(title => {
      const libAndVersion = title.match(/bump\s(.)+\sfrom\s[0-9.]+\sto\s[0-9.]+/gm);
      const lib = libAndVersion[0].split(' ')[1];
      const currentVersion = libAndVersion[0].split(' ')[3];
      const newVersion = libAndVersion[0].split(' ')[5];
      return { lib, currentVersion, newVersion };
    });
  }

  private async npmUpdate(libsAndVersions: LibAndVersion[]) {
    for (const libAndVersion of libsAndVersions) {
      try {
        const { lib, currentVersion, newVersion } = libAndVersion;
        console.log('----------------------------------------\n');
        console.log(`Updating ${lib} from ${currentVersion} to ${newVersion} ...`);
        const res = await execAsync(`cd ${this.path} && npm i ${lib}@${newVersion}`);
        console.log(res.stdout);
      } catch (err) {
        console.error(err.message);
      }
    }
  }
}

const dependabotUnifier = new DependabotUnifier();
