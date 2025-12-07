import { Command, CommandRunner, Option } from 'nest-commander';
import { SeedLoadTestService } from './seed-load-test.service';

interface SeedCommandOptions {
  users: number;
  posts: number;
  clean: boolean;
}

@Command({
  name: 'seed:load-test',
  description: '부하테스트용 시드 데이터 생성',
  options: { isDefault: false },
})
export class SeedLoadTestCommand extends CommandRunner {
  constructor(private readonly seedService: SeedLoadTestService) {
    super();
  }

  async run(params: string[], options: SeedCommandOptions): Promise<void> {
    try {
      await this.seedService.seed({
        users: options.users,
        posts: options.posts,
        clean: options.clean,
      });
      process.exit(0);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  @Option({
    flags: '-u, --users <number>',
    description: '생성할 사용자 수',
    defaultValue: 10,
  })
  parseUsers(val: string): number {
    const num = Number(val);
    if (isNaN(num) || num < 1) {
      throw new Error('사용자 수는 1 이상의 숫자여야 합니다.');
    }
    return num;
  }

  @Option({
    flags: '-p, --posts <number>',
    description: '생성할 게시글 수',
    defaultValue: 100,
  })
  parsePosts(val: string): number {
    const num = Number(val);
    if (isNaN(num) || num < 0) {
      throw new Error('게시글 수는 0 이상의 숫자여야 합니다.');
    }
    return num;
  }

  @Option({
    flags: '-c, --clean',
    description: '기존 데이터 삭제 후 생성 (TRUNCATE CASCADE)',
    defaultValue: false,
  })
  parseClean(): boolean {
    return true;
  }
}
