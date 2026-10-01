const API = "http://localhost:3000/jogos";
let jogos = [];
let idEditando = null;

const $ = id => document.getElementById(id);

function mensagem(texto) {
  $("msg").textContent = texto;
}

async function carregar() {
  try {
    const resp = await fetch(API);
    jogos = await resp.json();
    mostrar();
  } catch (erro) {
    console.error("Erro:", erro);
    mensagem("Não foi possível conectar com a API.");
  }
}

function mostrar() {
  $("lista").innerHTML = "";
  const busca = $("pesquisa").value.toLowerCase();
  const filtro = $("filtro").value;

  const lista = jogos.filter(j =>
    j.titulo.toLowerCase().includes(busca) &&
    (filtro === "Todos" || j.status === filtro)
  );

  lista.forEach(j => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<b>${j.titulo}</b> - ${j.genero} • ${j.plataforma} - Nota ${j.nota} - ${j.status} `;

    const editar = document.createElement("button");
    editar.textContent = "Editar";
    editar.onclick = () => editarJogo(j);

    const excluir = document.createElement("button");
    excluir.textContent = "Excluir";
    excluir.onclick = () => excluirJogo(j.id);

    card.append(editar, excluir);
    $("lista").append(card);
  });

  $("total").textContent = jogos.length;
  $("jogando").textContent = jogos.filter(j => j.status === "Jogando").length;
  $("finalizados").textContent = jogos.filter(j => j.status === "Finalizado").length;
}

$("form").onsubmit = async e => {
  e.preventDefault();

  const nota = $("nota").value;
  if (!$("titulo").value.trim() || !$("genero").value.trim() || !$("plataforma").value.trim()) {
    return mensagem("Preencha título, gênero e plataforma.");
  }
  if (nota === "" || nota < 0 || nota > 10) {
    return mensagem("A nota precisa estar entre 0 e 10.");
  }
  if (!$("status").value) {
    return mensagem("Selecione um status.");
  }

  const jogo = {
    titulo: $("titulo").value.trim(),
    genero: $("genero").value.trim(),
    plataforma: $("plataforma").value.trim(),
    nota: Number(nota),
    status: $("status").value
  };

  const editando = idEditando !== null;

  try {
    const resp = await fetch(editando ? API + "/" + idEditando : API, {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jogo)
    });
    if (!resp.ok) throw new Error("Erro na API");

    $("form").reset();
    idEditando = null;
    mensagem(editando ? "Jogo atualizado!" : "Jogo cadastrado!");
    carregar();
  } catch (erro) {
    console.error("Erro:", erro);
    mensagem("Não foi possível salvar o jogo.");
  }
};

function editarJogo(j) {
  idEditando = j.id;
  $("titulo").value = j.titulo;
  $("genero").value = j.genero;
  $("plataforma").value = j.plataforma;
  $("nota").value = j.nota;
  $("status").value = j.status;
  mensagem("Editando: " + j.titulo);
}

async function excluirJogo(id) {
  if (!confirm("Deseja excluir este jogo?")) return;

  try {
    const resp = await fetch(API + "/" + id, { method: "DELETE" });
    if (!resp.ok) throw new Error("Erro na API");

    mensagem("Jogo excluído!");
    carregar();
  } catch (erro) {
    console.error("Erro:", erro);
    mensagem("Não foi possível excluir o jogo.");
  }
}

$("pesquisa").oninput = mostrar;
$("filtro").onchange = mostrar;

carregar();