# Noravel

This is a web application framework based on php laravel

## Git guidelines

- [Create branch](#create-branch)
- [Commit message](#commit-message)
- [Commit types](#commit-types)
- [Commit scope](#commit-scope)
- [Commit subject](#commit-subject)
- [Create pull request](#create-pull-request)

### Create branch

---

Branches must be checked out from branch develop `git checkout -b <type>/<task-name>`.
The type of branch must be one of the following [the types of commit](#types).

```bash
git checkout -b feat/user-management
```

### Commit message

---

The commit message must be in the format `<type>(<scope>): <subject>`.

### Commit types

---

Must be one of the following:

| &lt;type&gt; | Description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| feat         | A new feature                                                                                         |
| fix          | A bug fix                                                                                             |
| docs         | Documentation only changes                                                                            |
| style        | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons,...) |
| refactor     | A code change that neither fixes a bug or adds a feature                                              |
| test         | Adding missing tests or correcting existing tests                                                     |
| chore        | Changes to the build process or auxiliary tools and libraries such as documentation generation        |

### Commit scope

The scope could be anything specifying place of the commit change.
For example: `user`, `project`, `task`, `task-item`, etc.

You can use `*` when the change affects more than a single scope.

### Commit subject

---

The subject contains succinct description of the change:

- Use the imperative, present tense: "change" not "changed" or "changes"
- Don't capitalize the first letter of the subject
- Don't add a period at the end of the subject

```bash
git commit -m "feat(user): display the list of users"
```

### Create pull request

---

First, rebase from the branch develop to get a latest code (`git pull --rebase origin develop`).
Then squash all commits into one commit before creating the `pull request`.

Example:

```bash
git pull --rebase origin develop
```

```bash
git log
```

We will see

```log
commit qyf70oe (HEAD -> feat/user-management, origin/feat/user-management)
Author: JohnDoe <johndoe@example.com>
Date:   Thu Dec 18 10:20:07 2025 +0700

    feat(user): display the list of users

commit p11ykz2
Author: JohnDoe <johndoe@example.com>
Date:   Tue Dec 16 13:30:00 2025 +0700

    feat(user): add user management

commit gps4sw9 (origin/develop, develop)
Author: JohnDoe <johndoe@example.com>
Date:   Tue Dec 16 11:39:44 2025 +0700

    feat(auth): login
```

Reset to the latest commit of develop

```bash
git reset gps4sw9
```

Create a new commit and push

```bash
git add .
```

```bash
git commit -m "feat(user): user management"
```

Check log

```bash
git log
```

Now we can see that the commits have been merged into 1 as `feat: user management`

```log
commit ztlvra9 (HEAD -> feat/user-management, origin/feat/user-management)
Author: JohnDoe <johndoe@example.com>
Date:   Thu Dec 18 10:25:27 2025 +0700

    feat(user): user management

commit gps4sw9 (origin/develop, develop)
Author: JohnDoe <johndoe@example.com>
Date:   Tue Dec 16 11:39:44 2025 +0700

    feat(auth): login
```

And push

```bash
git push -f
```

Now we can make a pull request.
