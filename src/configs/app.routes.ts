const postsRoot = 'posts';
const v1 = 'v1';

export const routesV1 = {
  version: v1,
  user: {
    root: postsRoot,
    byId: `${postsRoot}/:id`,
    delete: `${postsRoot}/:id`,
  },
};
