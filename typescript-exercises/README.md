#### TypeScript是目前不得不学的内容
* Ts的东西其实非常非常的多，上到`tsconfig`的配置，下到写法，内容。
* Ts正在疯狂的迭代，进入`4.0`版本即将，里面的内容非常非常的多，可以说，入门很简单，但是要写精通，真的还是要花很多功夫。
* 本文一共分上、下集,欢迎你关注我的公众号：【`前端巅峰`】,前端、后端、源码、架构、算法、面试都有,更有理财，心理学、开源项目等日常分享。
#### 正式开始
* 第一题,基本`interface`使用考察,定义一个`item`接口，符合使用
```
interface item {
  name: string;
  age: number;
  occupation: string;
}

const users: item[] = [
  {
    name: 'Max Mustermann',
    age: 25,
    occupation: 'Chimney sweep',
  },
  {
    name: 'Kate Müller',
    age: 23,
    occupation: 'Astronaut',
  },
];

function logPerson(user: item) {
  console.log(` - ${chalk.green(user.name)}, ${user.age}`);
}

console.log(chalk.yellow('Users:'));
users.forEach(logPerson);
```

* 第二题,考察联合类型,让`logPerson`函数不报错
```

interface User {
  name: string;
  age: number;
  occupation: string;
}

interface Admin {
  name: string;
  age: number;
  role: string;
}
type Person = User | Admin;
const persons: Person[] /* <- Person[] */ = [
  {
    name: 'Max Mustermann',
    age: 25,
    occupation: 'Chimney sweep',
  },
  {
    name: 'Jane Doe',
    age: 32,
    role: 'Administrator',
  },
  {
    name: 'Kate Müller',
    age: 23,
    occupation: 'Astronaut',
  },
  {
    name: 'Bruce Willis',
    age: 64,
    role: 'World saver',
  },
];

function logPerson(user: Person) {
  console.log(` - ${chalk.green(user.name)}, ${user.age}`);
}

persons.forEach(logPerson);
```

* 第三题,类型推断、联合类型、类型断言（此题我觉得不是最优解法,欢迎大家指出）,让`logPerson`不报错
```

interface User {
  name: string;
  age: number;
  occupation: string;
}

interface Admin {
  name: string;
  age: number;
  role: string;
}

type Person = User | Admin;

const persons: Person[] = [
  {
    name: 'Max Mustermann',
    age: 25,
    occupation: 'Chimney sweep',
  },
  {
    name: 'Jane Doe',
    age: 32,
    role: 'Administrator',
  },
  {
    name: 'Kate Müller',
    age: 23,
    occupation: 'Astronaut',
  },
  {
    name: 'Bruce Willis',
    age: 64,
    role: 'World saver',
  },
];

function logPerson(person: Person) {
  let additionalInformation: string;
  if ((person as Admin).role) {
    additionalInformation = (person as Admin).role;
  } else {
    additionalInformation = (person as User).occupation;
  }
  console.log(
    ` - ${chalk.green(person.name)}, ${person.age}, ${additionalInformation}`
  );
}

persons.forEach(logPerson);

```
* 第四题，我这里同样使用了类型断言和类型推断、联合类型解题（感觉也不是最优），让`logPerson`不报错
```

interface User {
  type: 'user';
  name: string;
  age: number;
  occupation: string;
}

interface Admin {
  type: 'admin';
  name: string;
  age: number;
  role: string;
}

type Person = User | Admin;

const persons: Person[] = [
  {
    type: 'user',
    name: 'Max Mustermann',
    age: 25,
    occupation: 'Chimney sweep',
  },
  { type: 'admin', name: 'Jane Doe', age: 32, role: 'Administrator' },
  { type: 'user', name: 'Kate Müller', age: 23, occupation: 'Astronaut' },
  { type: 'admin', name: 'Bruce Willis', age: 64, role: 'World saver' },
];

function isAdmin(person: Person) {
  return person.type === 'admin';
}

function isUser(person: Person) {
  return person.type === 'user';
}

function logPerson(person: Person) {
  let additionalInformation: string = '';
  if (isAdmin(person)) {
    additionalInformation = (person as Admin).role;
  }
  if (isUser(person)) {
    additionalInformation = (person as User).occupation;
  }
  console.log(
    ` - ${chalk.green(person.name)}, ${person.age}, ${additionalInformation}`
  );
}

console.log(chalk.yellow('Admins:'));
persons.filter(isAdmin).forEach(logPerson);

console.log();

console.log(chalk.yellow('Users:'));
persons.filter(isUser).forEach(logPerson);

```
* 第五题,我使用了索引签名解题,保证`filterUsers`函数不报错
```

interface User {
  type: 'user';
  name: string;
  age: number;
  occupation: string;
}

interface Admin {
  type: 'admin';
  name: string;
  age: number;
  role: string;
}

type Person = User | Admin;

const persons: Person[] = [
  {
    type: 'user',
    name: 'Max Mustermann',
    age: 25,
    occupation: 'Chimney sweep',
  },
  {
    type: 'admin',
    name: 'Jane Doe',
    age: 32,
    role: 'Administrator',
  },
  {
    type: 'user',
    name: 'Kate Müller',
    age: 23,
    occupation: 'Astronaut',
  },
  {
    type: 'admin',
    name: 'Bruce Willis',
    age: 64,
    role: 'World saver',
  },
  {
    type: 'user',
    name: 'Wilson',
    age: 23,
    occupation: 'Ball',
  },
  {
    type: 'admin',
    name: 'Agent Smith',
    age: 23,
    role: 'Administrator',
  },
];

const isAdmin = (person: Person): person is Admin => person.type === 'admin';
const isUser = (person: Person): person is User => person.type === 'user';

function logPerson(person: Person) {
  let additionalInformation: string = '';
  if (isAdmin(person)) {
    additionalInformation = person.role;
  }
  if (isUser(person)) {
    additionalInformation = person.occupation;
  }
  console.log(
    ` - ${chalk.green(person.name)}, ${person.age}, ${additionalInformation}`
  );
}

function filterUsers(
  persons: Person[],
  criteria: { age: number; [index: string]: number }
): User[] {
  return persons.filter(isUser).filter((user) => {
    let criteriaKeys = Object.keys(criteria) as (keyof User)[];
    return criteriaKeys.every((fieldName) => {
      return user[fieldName] === criteria[fieldName];
    });
  });
}

console.log(chalk.yellow('Users of age 23:'));

filterUsers(persons, {
  age: 23,
}).forEach(logPerson);

```
* 第六题，考察`overloads`,我对`filterPersons`单独进行了处理，解题，保证`logPerson`函数可以返回不同的类型数据
```
interface User {
  type: 'user';
  name: string;
  age: number;
  occupation: string;
}

interface Admin {
  type: 'admin';
  name: string;
  age: number;
  role: string;
}

type Person = User | Admin;

const persons: Person[] = [
  {
    type: 'user',
    name: 'Max Mustermann',
    age: 25,
    occupation: 'Chimney sweep',
  },
  { type: 'admin', name: 'Jane Doe', age: 32, role: 'Administrator' },
  { type: 'user', name: 'Kate Müller', age: 23, occupation: 'Astronaut' },
  { type: 'admin', name: 'Bruce Willis', age: 64, role: 'World saver' },
  { type: 'user', name: 'Wilson', age: 23, occupation: 'Ball' },
  { type: 'admin', name: 'Agent Smith', age: 23, role: 'Anti-virus engineer' },
];

function logPerson(person: Person) {
  console.log(
    ` - ${chalk.green(person.name)}, ${person.age}, ${
      person.type === 'admin' ? person.role : person.occupation
    }`
  );
}

function filterPersons(
  persons: Person[],
  personType: 'user',
  criteria: { [fieldName: string]: number }
): User[];

function filterPersons(
  persons: Person[],
  personType: 'admin',
  criteria: { [fieldName: string]: number }
): Admin[];

function filterPersons(
  persons: Person[],
  personType: string,
  criteria: { [fieldName: string]: number }
) {
  return persons
    .filter((person) => person.type === personType)
    .filter((person) => {
      let criteriaKeys = Object.keys(criteria) as (keyof Person)[];
      return criteriaKeys.every((fieldName) => {
        return person[fieldName] === criteria[fieldName];
      });
    });
}

let usersOfAge23: User[] = filterPersons(persons, 'user', { age: 23 });
let adminsOfAge23: Admin[] = filterPersons(persons, 'admin', { age: 23 });

console.log(chalk.yellow('Users of age 23:'));
usersOfAge23.forEach(logPerson);

console.log();

console.log(chalk.yellow('Admins of age 23:'));
adminsOfAge23.forEach(logPerson);
```
* 第七题,考察泛型使用，根据传入参数不同,动态返回不同类型的数据,保证`swap`函数运行正常

```
interface User {
  type: 'user';
  name: string;
  age: number;
  occupation: string;
}

interface Admin {
  type: 'admin';
  name: string;
  age: number;
  role: string;
}

function logUser(user: User) {
  const pos = users.indexOf(user) + 1;
  console.log(
    ` - #${pos} User: ${chalk.green(user.name)}, ${user.age}, ${
      user.occupation
    }`
  );
}

function logAdmin(admin: Admin) {
  const pos = admins.indexOf(admin) + 1;
  console.log(
    ` - #${pos} Admin: ${chalk.green(admin.name)}, ${admin.age}, ${admin.role}`
  );
}

const admins: Admin[] = [
  {
    type: 'admin',
    name: 'Will Bruces',
    age: 30,
    role: 'Overseer',
  },
  {
    type: 'admin',
    name: 'Steve',
    age: 40,
    role: 'Steve',
  },
];

const users: User[] = [
  {
    type: 'user',
    name: 'Moses',
    age: 70,
    occupation: 'Desert guide',
  },
  {
    type: 'user',
    name: 'Superman',
    age: 28,
    occupation: 'Ordinary person',
  },
];

function swap<T, L>(v1: T, v2: L): [L, T] {
  return [v2, v1];
}

function test1() {
  console.log(chalk.yellow('test1:'));
  const [secondUser, firstAdmin] = swap(admins[0], users[1]);
  logUser(secondUser);
  logAdmin(firstAdmin);
}

function test2() {
  console.log(chalk.yellow('test2:'));
  const [secondAdmin, firstUser] = swap(users[0], admins[1]);
  logAdmin(secondAdmin);
  logUser(firstUser);
}

function test3() {
  console.log(chalk.yellow('test3:'));
  const [secondUser, firstUser] = swap(users[0], users[1]);
  logUser(secondUser);
  logUser(firstUser);
}

function test4() {
  console.log(chalk.yellow('test4:'));
  const [firstAdmin, secondAdmin] = swap(admins[1], admins[0]);
  logAdmin(firstAdmin);
  logAdmin(secondAdmin);
}

function test5() {
  console.log(chalk.yellow('test5:'));
  const [stringValue, numericValue] = swap(123, 'Hello World');
  console.log(` - String: ${stringValue}`);
  console.log(` - Numeric: ${numericValue}`);
}

[test1, test2, test3, test4, test5].forEach((test) => test());


```

* 第八题，考察`Omit`和多类型`&`的使用，使用`Omit`提取`type`字段，最小代价完成了这道题
```

interface User {
    type: 'user';
    name: string;
    age: number;
    occupation: string;
}

interface Admin {
    type: 'admin';
    name: string;
    age: number;
    role: string;
}


type Person = User | Admin | PowerUser;

const persons: Person[] = [
    { type: 'user', name: 'Max Mustermann', age: 25, occupation: 'Chimney sweep' },
    { type: 'admin', name: 'Jane Doe', age: 32, role: 'Administrator' },
    { type: 'user', name: 'Kate Müller', age: 23, occupation: 'Astronaut' },
    { type: 'admin', name: 'Bruce Willis', age: 64, role: 'World saver' },
    {
        type: 'powerUser',
        name: 'Nikki Stone',
        age: 45,
        role: 'Moderator',
        occupation: 'Cat groomer'
    }
];


type PowerUser = Omit<User, 'type'> & Omit<Admin, 'type'> & {type: 'powerUser'};


function isAdmin(person: Person): person is Admin {
    return person.type === 'admin';
}

function isUser(person: Person): person is User {
    return person.type === 'user';
}

function isPowerUser(person: Person): person is PowerUser {
    return person.type === 'powerUser';
}

function logPerson(person: Person) {
    let additionalInformation: string = '';
    if (isAdmin(person)) {
        additionalInformation = person.role;
    }
    if (isUser(person)) {
        additionalInformation = person.occupation;
    }
    if (isPowerUser(person)) {
        additionalInformation = `${person.role}, ${person.occupation}`;
    }
    console.log(`${chalk.green(person.name)}, ${person.age}, ${additionalInformation}`);
}

console.log(chalk.yellow('Admins:'));
persons.filter(isAdmin).forEach(logPerson);

console.log();

console.log(chalk.yellow('Users:'));
persons.filter(isUser).forEach(logPerson);

console.log();

console.log(chalk.yellow('Power users:'));
persons.filter(isPowerUser).forEach(logPerson);
```
#### 写给读者
* 前面八道题并不一定是最优解法,`Ts`里面东西确实多，如果你有好的解法可以公众号后台私信我
* 后面会补充剩下的题目，由易到难
* 不定期补充前端架构师面试题、各种技术的系列学习题目
* 我是`Peter酱`，架构设计过`20万`人端到端加密超级群功能的桌面IM软件,我微信:`CALASFxiaotan`,`不闲聊`
* 另外欢迎收藏我的资料网站:`前端生活社区:https://qianduan.life`,可以`右下角`点个`在看`，关注一波公众号:[`前端巅峰`]