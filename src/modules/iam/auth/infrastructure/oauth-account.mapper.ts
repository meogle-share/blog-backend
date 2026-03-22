import { Injectable } from '@nestjs/common';
import { Mapper } from '@libs/ddd';
import { OAuthAccount } from '../domain/models/oauth-account.entity';
import { OAuthAccountModel } from './oauth-account.model';
import { AccountProvider } from '../domain/models/account-provider.vo';
import { ProviderId } from '../domain/models/provider-id.vo';

@Injectable()
export class OAuthAccountMapper implements Mapper<OAuthAccount, OAuthAccountModel> {
  toDomain(model: OAuthAccountModel): OAuthAccount {
    return OAuthAccount.from({
      id: model.id,
      props: {
        userId: model.userId,
        provider: AccountProvider.from(model.provider),
        providerAccountId: ProviderId.from(model.providerAccountId),
        providerLogin: model.providerLogin,
      },
    });
  }

  toModel(domain: OAuthAccount): OAuthAccountModel {
    const props = domain.getProps();
    return OAuthAccountModel.from({
      id: props.id,
      userId: props.userId,
      provider: props.provider.value,
      providerAccountId: props.providerAccountId.value,
      providerLogin: props.providerLogin,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
