//importado
const express = require("express");
const bodyParser = require("body-parser");
const {Pool} = require("pg");
const path = require("path");
const cors = require("cors");

//configurando
const app = express();
const porta = 8085;
const ipDoServidor = "127.0.0.1";

//configuração com o banco de dados
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  port: 5433,
  database: "cadastroAluno",
  password: "postgres",
});

//configura o express para entender json e formulário html

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
//serve arquivos estáticos da pasta views
app.use(express.static(path.join(__dirname, "views"))); 

//rota raiz
app.get("/", function (req, res) {
  res.redirect("/resultado");
});

//rota para exibir o formulario de cadastro
app.get("/cadastroAluno", function(req, res){
    res.sendFile(path.join(__dirname, "views", "cadastro.html"));
})

//rota para cadastrar um aluno(post)
app.post("/cadastroAluno", function (req, res) {
  const {nome, idade} = req.body;

  pool.query(
    "INSERT INTO aluno(nome, idade) VALUES ($1, $2)",
    [nome, idade],
    (error) => {
      if (error) {
        console.error("Erro ao inserir aluno",error.message);
        res.status(500).json({
            status: "erro",
            message: "Erro ao inserir dados:" + error.message,
        });
      } else {
        res.status(201).json({
            status: "sucesso",
            message: "Aluno cadastrado com sucesso",
        });
      }
    }
  );
});

const aluno = [];

//listar todos os alunos
app.get("/resultado", function(req, res){
    pool.query("SELECT id, nome, idade FROM aluno ORDER BY id ASC", (error,result) => {
        if(error){
        res.status(500).json({
            status:"erro",
            mensagem: "Erro ao consultar alunos" + error.message,
        });
        }else{
            res.status(200).json({
                status: "sucesso",
                alunos: result.rows,
            });
        }
    })
});

//listar todos os nomes dos alunos ordenados por nome
app.get("/alunos/nomes", function(req, res){
  pool.query("SELECT nome FROM aluno ORDER BY nome ASC", (error, result)=>{
    if(error){
      res.status(500).json({
        status: "error",
        mensagem: "Erro ao consultar nomes de alunos" + error.message,
      });
    }else{
      const nomes = result.rows.map(aluno => aluno.nome);

      res.status(200).json({
        status: "sucesso",
        nomes: nomes,
      });
    }
  });
});

app.listen(porta, ipDoServidor, function () {
  console.log(
    "\n Aplicacao web executando em http://" + ipDoServidor + ":" + porta
  );
});