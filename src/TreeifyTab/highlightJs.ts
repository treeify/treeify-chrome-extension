import hljs from 'highlight.js/lib/core'
import applescript from 'highlight.js/lib/languages/applescript'
import arduino from 'highlight.js/lib/languages/arduino'
import autohotkey from 'highlight.js/lib/languages/autohotkey'
import awk from 'highlight.js/lib/languages/awk'
import bash from 'highlight.js/lib/languages/bash'
import basic from 'highlight.js/lib/languages/basic'
import c from 'highlight.js/lib/languages/c'
import clean from 'highlight.js/lib/languages/clean'
import clojure from 'highlight.js/lib/languages/clojure'
import coffeescript from 'highlight.js/lib/languages/coffeescript'
import coq from 'highlight.js/lib/languages/coq'
import cpp from 'highlight.js/lib/languages/cpp'
import crystal from 'highlight.js/lib/languages/crystal'
import csharp from 'highlight.js/lib/languages/csharp'
import csp from 'highlight.js/lib/languages/csp'
import css from 'highlight.js/lib/languages/css'
import d from 'highlight.js/lib/languages/d'
import dart from 'highlight.js/lib/languages/dart'
import delphi from 'highlight.js/lib/languages/delphi'
import diff from 'highlight.js/lib/languages/diff'
import django from 'highlight.js/lib/languages/django'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import elixir from 'highlight.js/lib/languages/elixir'
import elm from 'highlight.js/lib/languages/elm'
import erlang from 'highlight.js/lib/languages/erlang'
import fortran from 'highlight.js/lib/languages/fortran'
import fsharp from 'highlight.js/lib/languages/fsharp'
import glsl from 'highlight.js/lib/languages/glsl'
import go from 'highlight.js/lib/languages/go'
import gradle from 'highlight.js/lib/languages/gradle'
import groovy from 'highlight.js/lib/languages/groovy'
import haml from 'highlight.js/lib/languages/haml'
import haskell from 'highlight.js/lib/languages/haskell'
import haxe from 'highlight.js/lib/languages/haxe'
import hsp from 'highlight.js/lib/languages/hsp'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import julia from 'highlight.js/lib/languages/julia'
import kotlin from 'highlight.js/lib/languages/kotlin'
import latex from 'highlight.js/lib/languages/latex'
import less from 'highlight.js/lib/languages/less'
import lisp from 'highlight.js/lib/languages/lisp'
import livescript from 'highlight.js/lib/languages/livescript'
import llvm from 'highlight.js/lib/languages/llvm'
import lua from 'highlight.js/lib/languages/lua'
import makefile from 'highlight.js/lib/languages/makefile'
import markdown from 'highlight.js/lib/languages/markdown'
import mathematica from 'highlight.js/lib/languages/mathematica'
import matlab from 'highlight.js/lib/languages/matlab'
import maxima from 'highlight.js/lib/languages/maxima'
import mel from 'highlight.js/lib/languages/mel'
import nginx from 'highlight.js/lib/languages/nginx'
import nim from 'highlight.js/lib/languages/nim'
import nsis from 'highlight.js/lib/languages/nsis'
import objectivec from 'highlight.js/lib/languages/objectivec'
import ocaml from 'highlight.js/lib/languages/ocaml'
import openscad from 'highlight.js/lib/languages/openscad'
import perl from 'highlight.js/lib/languages/perl'
import pgsql from 'highlight.js/lib/languages/pgsql'
import php from 'highlight.js/lib/languages/php'
import powershell from 'highlight.js/lib/languages/powershell'
import processing from 'highlight.js/lib/languages/processing'
import prolog from 'highlight.js/lib/languages/prolog'
import protobuf from 'highlight.js/lib/languages/protobuf'
import puppet from 'highlight.js/lib/languages/puppet'
import python from 'highlight.js/lib/languages/python'
import qml from 'highlight.js/lib/languages/qml'
import r from 'highlight.js/lib/languages/r'
import reasonml from 'highlight.js/lib/languages/reasonml'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import sas from 'highlight.js/lib/languages/sas'
import scala from 'highlight.js/lib/languages/scala'
import scheme from 'highlight.js/lib/languages/scheme'
import scilab from 'highlight.js/lib/languages/scilab'
import scss from 'highlight.js/lib/languages/scss'
import shell from 'highlight.js/lib/languages/shell'
import smalltalk from 'highlight.js/lib/languages/smalltalk'
import sml from 'highlight.js/lib/languages/sml'
import sql from 'highlight.js/lib/languages/sql'
import stan from 'highlight.js/lib/languages/stan'
import stata from 'highlight.js/lib/languages/stata'
import stylus from 'highlight.js/lib/languages/stylus'
import swift from 'highlight.js/lib/languages/swift'
import tcl from 'highlight.js/lib/languages/tcl'
import thrift from 'highlight.js/lib/languages/thrift'
import twig from 'highlight.js/lib/languages/twig'
import typescript from 'highlight.js/lib/languages/typescript'
import vbnet from 'highlight.js/lib/languages/vbnet'
import vbscript from 'highlight.js/lib/languages/vbscript'
import verilog from 'highlight.js/lib/languages/verilog'
import vhdl from 'highlight.js/lib/languages/vhdl'
import vim from 'highlight.js/lib/languages/vim'
import wasm from 'highlight.js/lib/languages/wasm'
import xml from 'highlight.js/lib/languages/xml'
import xquery from 'highlight.js/lib/languages/xquery'
import yaml from 'highlight.js/lib/languages/yaml'
import zephir from 'highlight.js/lib/languages/zephir'
import {Set} from 'immutable'

/** シンタックスハイライトした結果のHTML文字列を返す */
export function getHighlightedHtml(code: string, language: string): string {
  // ライブラリが対応していない言語の場合例外が投げられる
  try {
    const highlightResult = hljs.highlight(code, {
      ignoreIllegals: true,
      language,
    })
    return highlightResult.value
  } catch {
    return code
  }
}

/** 与えられたコードの言語を自動検出して言語名を返す */
export function detectLanguage(code: string): string {
  const autoHighlightResult = hljs.highlightAuto(code, autoDetectionLanguages.toArray())
  return autoHighlightResult.language ?? ''
}

/**
 * highlight.jsで使う言語を全て登録する。
 * グローバルスコープに登録されるのでアプリの起動時に1回呼べばOK。
 *
 * highlight.jsで使用可能な全ての言語を登録しているわけではない点に注意。
 * 本来ハイライトすべきでない識別子がマイナー言語のキーワードと偶然一致してハイライトされてしまう問題を回避するため、
 * Treeify開発者の判断でコメントアウトしてある。
 */
export function registerLanguages() {
  for (const languageDefinitionsKey in languageDefinitions) {
    // @ts-ignore
    hljs.registerLanguage(languageDefinitionsKey, languageDefinitions[languageDefinitionsKey])
  }
}

const languageDefinitions = {
  // 1c,
  // abnf,
  // accesslog,
  // actionscript,
  // ada,
  // angelscript,
  // apache,
  applescript,
  // arcade,
  arduino,
  // armasm,
  // asciidoc,
  // aspectj,
  autohotkey,
  // autoit,
  // avrasm,
  awk,
  // axapta,
  bash,
  basic,
  // bnf,
  // brainfuck,
  c,
  // cal,
  // capnproto,
  // ceylon,
  clean,
  clojure,
  // clojure-repl,
  // cmake,
  coffeescript,
  coq,
  // cos,
  cpp,
  // crmsh,
  crystal,
  csharp,
  csp,
  css,
  d,
  dart,
  delphi,
  diff,
  django,
  // dns,
  dockerfile,
  // dos,
  // dsconfig,
  // dts,
  // dust,
  // ebnf,
  elixir,
  elm,
  // erb,
  erlang,
  // erlang-repl,
  // excel,
  // fix,
  // flix,
  fortran,
  fsharp,
  // gams,
  // gauss,
  // gcode,
  // gherkin,
  glsl,
  // gml,
  go,
  // golo,
  gradle,
  groovy,
  haml,
  // handlebars,
  haskell,
  haxe,
  hsp,
  // http,
  // hy,
  // inform7,
  ini,
  // irpf90,
  // isbl,
  java,
  javascript,
  // jboss-cli,
  json,
  julia,
  // julia-repl,
  kotlin,
  // lasso,
  latex,
  // ldif,
  // leaf,
  less,
  lisp,
  // livecodeserver,
  livescript,
  llvm,
  // lsl,
  lua,
  makefile,
  markdown,
  mathematica,
  matlab,
  maxima,
  mel,
  // mercury,
  // mipsasm,
  // mizar,
  // mojolicious,
  // monkey,
  // moonscript,
  // n1ql,
  // nestedtext,
  nginx,
  nim,
  // nix,
  // node-repl,
  nsis,
  objectivec,
  ocaml,
  openscad,
  // oxygene,
  // parser3,
  perl,
  // pf,
  pgsql,
  php,
  // php-template,
  // plaintext,
  // pony,
  powershell,
  processing,
  // profile,
  prolog,
  // properties,
  protobuf,
  puppet,
  // purebasic,
  python,
  // python-repl,
  // q,
  qml,
  r,
  reasonml,
  // rib,
  // roboconf,
  // routeros,
  // rsl,
  ruby,
  // ruleslanguage,
  rust,
  sas,
  scala,
  scheme,
  scilab,
  scss,
  shell,
  // smali,
  smalltalk,
  sml,
  // sqf,
  sql,
  stan,
  stata,
  // step21,
  stylus,
  // subunit,
  swift,
  // taggerscript,
  // tap,
  tcl,
  thrift,
  // tp,
  twig,
  typescript,
  // vala,
  vbnet,
  vbscript,
  // vbscript-html,
  verilog,
  vhdl,
  vim,
  wasm,
  // wren,
  // x86asm,
  // xl,
  xml,
  xquery,
  yaml,
  zephir,
}

const languagesToExcludeFromAutoDetection = Set.of(
  // TypeScriptのコードに対して誤検出された
  'qml',
  // TypeScriptのコードに対して誤検出された
  'reasonml',
  // TypeScriptのコードに対して誤検出された
  'stylus'
)

export const autoDetectionLanguages = Set(Object.keys(languageDefinitions)).subtract(
  languagesToExcludeFromAutoDetection
)
