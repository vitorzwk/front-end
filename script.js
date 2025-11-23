/* ============================================
   Paixão e Saúde – Gestão de Saúde Ocupacional
   script.js – Controle de Exames Ocupacionais
=============================================== */

// Lista principal de registros
let exames = JSON.parse(localStorage.getItem("exames_ocupacionais")) || [];

// Elementos
const form = document.getElementById("form");
const tbody = document.getElementById("tbody");
const count = document.getElementById("count");
const total = document.getElementById("total");
const grandTotal = document.getElementById("grandTotal");
const itemsTotal = document.getElementById("itemsTotal");

const q = document.getElementById("q");
const filterCategory = document.getElementById("filterCategory");
const sortBy = document.getElementById("sortBy");


// =========================
// Salvar no LocalStorage
// =========================
function salvarLocal() {
    localStorage.setItem("exames_ocupacionais", JSON.stringify(exames));
}


// =========================
// Atualizar Tabela
// =========================
function atualizarTabela() {
    tbody.innerHTML = "";

    if (exames.length === 0) {
        tbody.innerHTML = `
          <tr class="empty-row">
            <td class="empty" colspan="7">Nenhum exame cadastrado.</td>
          </tr>
        `;
        atualizarTotais();
        return;
    }

    const termo = q.value.toLowerCase();
    const filtro = filterCategory.value;

    let lista = exames
        .filter(ex =>
            (ex.nome.toLowerCase().includes(termo) ||
            ex.cargo.toLowerCase().includes(termo)) &&
            (filtro === "" || ex.tipo === filtro)
        );

    // Ordenação
    if (sortBy.value === "date_desc") {
        lista.sort((a,b) => new Date(b.data) - new Date(a.data));
    } else if (sortBy.value === "date_asc") {
        lista.sort((a,b) => new Date(a.data) - new Date(b.data));
    } else if (sortBy.value === "price_desc") {
        lista.sort((a,b) => b.custo - a.custo);
    } else if (sortBy.value === "price_asc") {
        lista.sort((a,b) => a.custo - b.custo);
    }

    // Montar linhas
    lista.forEach((ex, i) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${ex.nome}</td>
            <td>${ex.cargo}</td>
            <td>${ex.tipo}</td>
            <td>${ex.idade}</td>
            <td>R$ ${ex.custo.toFixed(2)}</td>
            <td>${ex.data}</td>
            <td>
                <button class="btn btn-primary" onclick="editar(${i})">Editar</button>
                <button class="btn btn-ghost" onclick="excluir(${i})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    atualizarTotais();
}


// =========================
// Atualizar Totais
// =========================
function atualizarTotais() {
    const totalRegistros = exames.length;
    itemsTotal.textContent = totalRegistros;
    count.textContent = totalRegistros;

    const soma = exames.reduce((acc, ex) => acc + ex.custo, 0);
    total.textContent = `R$ ${soma.toFixed(2)}`;
    grandTotal.textContent = `R$ ${soma.toFixed(2)}`;
}


// =========================
// Adicionar / Editar Exame
// =========================
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("id").value;
    const nome = document.getElementById("title").value;
    const cargo = document.getElementById("supplier").value;
    const tipo = document.getElementById("category").value;
    const idade = Number(document.getElementById("quantity").value);
    const custo = Number(document.getElementById("unitPrice").value);
    const data = document.getElementById("date").value;
    const obs = document.getElementById("notes").value;

    const registro = { nome, cargo, tipo, idade, custo, data, obs };

    if (id) {
        exames[id] = registro;
    } else {
        exames.push(registro);
    }

    form.reset();
    document.getElementById("id").value = "";

    salvarLocal();
    atualizarTabela();
});


// =========================
// Editar registro
// =========================
function editar(i) {
    const ex = exames[i];
    document.getElementById("id").value = i;

    document.getElementById("title").value = ex.nome;
    document.getElementById("supplier").value = ex.cargo;
    document.getElementById("category").value = ex.tipo;
    document.getElementById("quantity").value = ex.idade;
    document.getElementById("unitPrice").value = ex.custo;
    document.getElementById("date").value = ex.data;
    document.getElementById("notes").value = ex.obs;
}


// =========================
// Excluir registro
// =========================
function excluir(i) {
    if (confirm("Deseja excluir este exame?")) {
        exames.splice(i, 1);
        salvarLocal();
        atualizarTabela();
    }
}


// =========================
// Importar JSON
// =========================
document.getElementById("btnImport").onclick = () => {
    document.getElementById("fileInput").click();
};

document.getElementById("fileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        exames = JSON.parse(reader.result);
        salvarLocal();
        atualizarTabela();
    };
    reader.readAsText(file);
});


// =========================
// Exportar JSON
// =========================
document.getElementById("btnExport").onclick = () => {
    const blob = new Blob([JSON.stringify(exames, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = "exames_ocupacionais.json";
    a.click();
};


// =========================
// Limpar tudo
// =========================
document.getElementById("btnClear").onclick = () => {
    if (confirm("Deseja realmente apagar todos os registros?")) {
        exames = [];
        salvarLocal();
        atualizarTabela();
    }
};


// =========================
// Filtros dinâmicos
// =========================
q.oninput = atualizarTabela;
filterCategory.onchange = atualizarTabela;
sortBy.onchange = atualizarTabela;


// Inicializar tabela ao carregar a página
atualizarTabela();
