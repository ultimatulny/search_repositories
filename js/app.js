let search_input = document.querySelector(".search__input");
let search_suggestions = document.querySelector(".search__suggestions");
let reposBlock = document.querySelector(".repos");
let currentSearch = [];

const debounce = (fn, debounceTime) => {
  let lastTime = null;
  return function () {
    let call = () => {
      fn.apply(this, arguments);
    };
    clearTimeout(lastTime);
    lastTime = setTimeout(call, debounceTime);
  };
};

function clearSuggestions() {
  while (search_suggestions.firstChild) {
    search_suggestions.removeChild(search_suggestions.firstChild);
  }
}

function createSuggestionElem(id, name) {
  let li = document.createElement("li");
  li.classList.add("search__result");
  li.setAttribute("data-repid", id);
  li.textContent = name;
  return li;
}

function renderSuggestions(arr) {
  if (arr.length == 0) return;

  arr.forEach((element) => {
    search_suggestions.appendChild(
      createSuggestionElem(element.id, element.name)
    );
  });
}

const searchRepositories = debounce((request) => {
  clearSuggestions();
  fetch(`https://api.github.com/search/repositories?q=${request}&per_page=5`)
    .then((response) => response.json())
    .then((response) => {
      if (search_input.value.trim() === request) {
        renderSuggestions(response.items);
        currentSearch = response.items;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}, 400);

function createSafeElem(obj, id) {
  let repos_safe = document.createElement("div");
  repos_safe.setAttribute("data-repid", id);
  repos_safe.classList.add("repos__safe");
  let info = document.createElement("div");
  info.classList.add("repos__info");

  let name = document.createElement("div");
  name.textContent = `Name: ${obj.name}`;
  info.appendChild(name);

  let owner = document.createElement("div");
  owner.textContent = `Owner: ${obj.owner.login}`;
  info.appendChild(owner);

  let stars = document.createElement("div");
  stars.textContent = `Stars: ${obj.stargazers_count}`;
  info.appendChild(stars);

  repos_safe.appendChild(info);
  let removeBtn = document.createElement("button");
  removeBtn.textContent = "X";
  removeBtn.classList.add("repos__remove-btn");
  removeBtn.setAttribute("data-repid", id);
  repos_safe.appendChild(removeBtn);
  return repos_safe;
}

function safeRepository(id) {
  let safeThis = currentSearch.filter((elem) => elem.id == id);
  reposBlock.insertAdjacentElement(
    "afterbegin",
    createSafeElem(safeThis[0], id)
  );
}

search_input.addEventListener("keyup", (e) => {
  if (search_input.value.trim() === "") {
    clearSuggestions();
  }
  if (search_input.value != "" && e.key != " ") {
    searchRepositories(search_input.value);
  }
});

search_suggestions.addEventListener("click", (e) => {
  let target = e.target;
  safeRepository(target.dataset.repid);
  clearSuggestions();
  search_input.value = "";
});

reposBlock.addEventListener("click", (e) => {
  let target = e.target;
  if (target.closest(".repos__remove-btn")) {
    let removeElem = document.querySelector(
      '.repos__safe[data-repid="' + target.dataset.repid + '"]'
    );
    removeElem.remove();
  }
});
