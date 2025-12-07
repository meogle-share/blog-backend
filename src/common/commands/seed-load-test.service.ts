import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { PostModel } from '@modules/content/post/infrastructure/post.model';
import { UserModelFactory } from '@libs/typeorm/factories/user.model.factory';
import { v7 as uuidv7 } from 'uuid';
import { appEnv } from '@configs/env';
import { NodeEnvironment } from '@configs/env.validator';

export interface SeedOptions {
  users: number;
  posts: number;
  clean: boolean;
}

@Injectable()
export class SeedLoadTestService {
  private readonly logger = new Logger(SeedLoadTestService.name, { timestamp: true });

  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepo: Repository<AccountModel>,
    @InjectRepository(UserModel)
    private readonly userRepo: Repository<UserModel>,
    @InjectRepository(PostModel)
    private readonly postRepo: Repository<PostModel>,
  ) {}

  async seed(options: SeedOptions): Promise<void> {
    if (appEnv.NODE_ENV !== NodeEnvironment.LOAD_TEST) {
      this.logger.error(
        `해당 명령어는 "${NodeEnvironment.LOAD_TEST}" (부하 테스트) 환경에서만 실행할 수 있습니다. (현재: "${appEnv.NODE_ENV}")`,
      );
      return;
    }

    try {
      this.logger.log('부하테스트용 시드 데이터 생성 시작...');

      if (options.clean) {
        await this.clean();
      }

      const { accounts, users } = await this.seedUsersWithAccounts(options.users);

      await this.seedPosts(options.posts, users);

      this.logger.log('시드 데이터 생성 완료!');
      this.logger.log(` - Accounts: ${accounts.length}개`);
      this.logger.log(` - Users: ${users.length}개`);
      this.logger.log(` - Posts: ${options.posts}개`);
    } catch (error) {
      this.logger.error('시드 데이터 생성 실패');
      throw error;
    }
  }

  private async clean(): Promise<void> {
    try {
      this.logger.log('기존 데이터 삭제 중...');

      await this.postRepo.query('TRUNCATE TABLE posts CASCADE');
      await this.userRepo.query('TRUNCATE TABLE users CASCADE');
      await this.accountRepo.query('TRUNCATE TABLE accounts CASCADE');

      this.logger.log('데이터 삭제 완료');
    } catch (error) {
      this.logger.error('데이터 삭제 실패');
      throw new Error(
        `데이터 삭제 중 에러 발생: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async seedUsersWithAccounts(count: number): Promise<{
    accounts: AccountModel[];
    users: UserModel[];
  }> {
    try {
      this.logger.log(`${count}명의 사용자 생성 중...`);

      UserModelFactory.reset();
      const { accounts, users } = UserModelFactory.createWithAccount(count);

      if (accounts.length === 0 || users.length === 0) {
        throw new Error('Factory에서 사용자 데이터 생성 실패');
      }

      const savedAccounts = await this.accountRepo.save(accounts);
      const savedUsers = await this.userRepo.save(users);

      this.logger.log(`사용자 생성 완료 (${savedUsers.length}명)`);

      return { accounts: savedAccounts, users: savedUsers };
    } catch (error) {
      this.logger.error('사용자 생성 실패');
      throw new Error(
        `사용자 생성 중 에러 발생: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async seedPosts(count: number, users: UserModel[]): Promise<void> {
    if (count === 0) {
      return;
    }

    try {
      if (users.length === 0) {
        throw new Error('게시글 작성자가 없습니다. 먼저 사용자를 생성해주세요.');
      }

      this.logger.log(`${count}개의 게시글 생성 중...`);

      const posts: PostModel[] = [];
      const now = new Date();

      for (let i = 1; i <= count; i++) {
        const author = users[i % users.length];

        const post = PostModel.from({
          id: uuidv7(),
          title: `테스트 게시글 #${i}`,
          content: `이것은 부하 테스트를 위한 샘플 게시글입니다. 게시글 번호: ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
          authorId: author.id,
          createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        });

        posts.push(post);
      }

      const batchSize = 100;
      for (let i = 0; i < posts.length; i += batchSize) {
        const batch = posts.slice(i, i + batchSize);
        await this.postRepo.save(batch);
        this.logger.log(` - 진행률: ${Math.min(i + batchSize, posts.length)}/${posts.length}`);
      }

      this.logger.log(`게시글 생성 완료 (${posts.length}개)`);
    } catch (error) {
      this.logger.error('게시글 생성 실패');
      throw new Error(
        `게시글 생성 중 에러 발생: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
