const listEl = document.querySelector("ul");
const formEl = document.querySelector("form");
const buttonDelete = document.getElementById("delete");
const buttonCancel = document.getElementById("cancel");
const buttonSubmit = document.getElementById("submit");

let employees = [];
let roles = [];
let selectedItem;

//função que inicia a aplicação e carrega os dados
async function init() {
  //pegando lista de funcionários e cargos da base de dados
  [employees, roles] = await Promise.all([
    listEmployees(),
    listRoles()
  ]);

  renderRoles();
  renderData();
  clearSelection();

  buttonCancel.addEventListener("click", clearSelection);
  formEl.addEventListener("submit", onSubmit);
  buttonDelete.addEventListener("click", onDelete);
}
init();

function selectItem(employee, li) {

  clearSelection();
  selectedItem = employee;

  //atribui classe selected ao item selecionado
  li.classList.add("selected");

  //atribui informações do funcionário selecionados aos inputs
  formEl.name.value = employee.name;
  formEl.salary.valueAsNumber = employee.salary;
  formEl.role_id.value = employee.role_id;

  //ativa botões delete e cancel
  buttonDelete.style.display = "inline";
  buttonCancel.style.display = "inline";
  buttonSubmit.textContent = "Update";
}

function clearSelection() {
  selectedItem = undefined;
  showError("");
  const li = listEl.querySelector(".selected");

  //caso encontre algum elemento com a classe selected vai retirar
  if (li) {
    li.classList.remove("selected");
  }

  //limpando campos
  formEl.name.value = "";
  formEl.salary.value = "";
  formEl.role_id.value = "";
  //ocultando botões cancel e delete
  buttonDelete.style.display = "none";
  buttonCancel.style.display = "none";
  buttonSubmit.textContent = "Create";
}

async function onSubmit(evt) {
  //não vai recarregar a página com o submit
  evt.preventDefault();
  //atribuindo dados dos inputs a um novo objeto
  const employeeData = {
    name: formEl.name.value,
    salary: formEl.salary.valueAsNumber,
    role_id: +formEl.role_id.value
  };

  if (!employeeData.name || !employeeData.salary || !employeeData.role_id) {
    showError("You must fill all form fields");
    return
  }

  //caso tenha um item previamente selecionado, vai usar os dados para atualizar esse item
  if (selectedItem) {
    //chamando método atualizar
    const updateItem = await updateEmployee(selectedItem.id, employeeData);
    //pegando o index do item selecionado
    const i = employees.indexOf(selectedItem);
    //setando novo objeto ao indice selecionado
    employees[i] = updateItem;

    renderData();
    //limpando seleção do novo item criado
    selectItem(updateItem, listEl.children[i]);
  } else {
    //caso não tenha nenhum item selecionado, chama o método para criar um novo item
    const createdItem = await createEmployee(employeeData);
    employees.push(createdItem);
    renderData();
    selectItem(createdItem, listEl.lastChild);
    listEl.lastChild.scrollIntoView();
  }
}

async function onDelete() {
  if (selectedItem) {
    await deleteEmployee(selectedItem.id);
    //pegando o index do item selecionado
    const i = employees.indexOf(selectedItem);
    //retirando o item selecionado do array
    employees.splice(i, 1);
    renderData();
    clearSelection();
  }
}

function renderData() {
  listEl.innerHTML = "";
  //listando todos os funcionários
  for (const employee of employees) {

    let role = roles.find((role) => role.id == employee.role_id);
    const li = document.createElement("li");
    const divName = document.createElement("div");
    const divRole = document.createElement("div");

    divName.textContent = employee.name;
    divRole.textContent = role.name;

    li.appendChild(divName);
    li.appendChild(divRole);
    listEl.appendChild(li);

    li.addEventListener("click", () => selectItem(employee, li));

  }
}

function renderRoles() {
  //listando funções no select option
  for (const role of roles) {

    const option = document.createElement("option");

    option.textContent = role.name;
    option.value = role.id;
    formEl.role_id.appendChild(option);
  }
}

//renderiza o erro para o front
function showError(message, error) {
  document.getElementById("errors").textContent = message;

  if (error) {
    console.error(error);
  }
}



