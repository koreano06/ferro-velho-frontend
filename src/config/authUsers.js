export const AUTH_USERS = [
  {
    username: "gomes",
    pin: "1234",
    role: "owner",
    name: "Gomes",
  },
  {
    username: "joao",
    pin: "2222",
    role: "employee",
    name: "Joao",
  },
  {
    username: "consulta",
    pin: "0000",
    role: "viewer",
    name: "Consulta",
  },
];

export const ROLE_LABELS = {
  owner: "Dono",
  employee: "Funcionario",
  viewer: "Somente leitura",
};

export const ROLE_HOME = {
  owner: "/",
  employee: "/compras",
  viewer: "/estoque",
};
