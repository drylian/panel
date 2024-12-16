import Elysia, { Context } from "elysia";

export class PermissionGroup<GroupKey extends string, GroupPrefix extends string, GroupDescription extends string, GroupPermissions extends ReturnType<typeof setPermission<string, string, string>>[]> {
   public readonly perms: MappedByKey<"perm", GroupPermissions>;
   public readonly prefix;
   public readonly description;
   public readonly key;
   constructor(opts: {
      key: GroupKey;
      prefix: GroupPrefix;
      description: GroupDescription;
      perms: GroupPermissions
   }) {
      this.key = opts.key;
      this.prefix = opts.prefix;
      this.description = opts.description;
      this.perms = Object.assign({}, ...opts.perms.map(perm => ({ [perm.perm]: perm })));
   }

   public get<Key extends keyof typeof this.perms>(key: Key) {
      return this.perms[key];
   }

   public check(ctx:Context)
}

function setPermission<Title extends string, Description extends string, Perm extends string, PermAllow extends ("va")[]>(perm: {
   title: Title;
   description: Description;
   perm: Perm;
   allow:PermAllow
}) {
   return perm;
}

const test = setPermission({
   title: 'test',
   description: 'test',
   perm: 'test'
});