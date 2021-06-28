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

/**
 * highlight.jsで使う言語を全て登録する。
 * グローバルスコープに登録されるのでアプリの起動時に1回呼べばOK。
 *
 * highlight.jsで使用可能な全ての言語を登録しているわけではない点に注意。
 * マイナー or 古すぎて言語名入力補完のノイズにしかならなそうな言語や、
 * シンタックスハイライトのサポートをユーザーが期待しないと考えられるような言語は、
 * Treeify開発者の判断でコメントアウトしてある。
 */
export function registerLanguages() {
  // hljs.registerLanguage('1c', 1c)
  // hljs.registerLanguage('abnf', abnf)
  // hljs.registerLanguage('accesslog', accesslog)
  // hljs.registerLanguage('actionscript', actionscript)
  // hljs.registerLanguage('ada', ada)
  // hljs.registerLanguage('angelscript', angelscript)
  // hljs.registerLanguage('apache', apache)
  hljs.registerLanguage('applescript', applescript)
  // hljs.registerLanguage('arcade', arcade)
  hljs.registerLanguage('arduino', arduino)
  // hljs.registerLanguage('armasm', armasm)
  // hljs.registerLanguage('asciidoc', asciidoc)
  // hljs.registerLanguage('aspectj', aspectj)
  hljs.registerLanguage('autohotkey', autohotkey)
  // hljs.registerLanguage('autoit', autoit)
  // hljs.registerLanguage('avrasm', avrasm)
  hljs.registerLanguage('awk', awk)
  // hljs.registerLanguage('axapta', axapta)
  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('basic', basic)
  // hljs.registerLanguage('bnf', bnf)
  // hljs.registerLanguage('brainfuck', brainfuck)
  hljs.registerLanguage('c', c)
  // hljs.registerLanguage('cal', cal)
  // hljs.registerLanguage('capnproto', capnproto)
  // hljs.registerLanguage('ceylon', ceylon)
  hljs.registerLanguage('clean', clean)
  hljs.registerLanguage('clojure', clojure)
  // hljs.registerLanguage('clojure-repl', clojure-repl)
  // hljs.registerLanguage('cmake', cmake)
  hljs.registerLanguage('coffeescript', coffeescript)
  hljs.registerLanguage('coq', coq)
  // hljs.registerLanguage('cos', cos)
  hljs.registerLanguage('cpp', cpp)
  // hljs.registerLanguage('crmsh', crmsh)
  hljs.registerLanguage('crystal', crystal)
  hljs.registerLanguage('csharp', csharp)
  hljs.registerLanguage('csp', csp)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('d', d)
  hljs.registerLanguage('dart', dart)
  hljs.registerLanguage('delphi', delphi)
  hljs.registerLanguage('diff', diff)
  hljs.registerLanguage('django', django)
  // hljs.registerLanguage('dns', dns)
  hljs.registerLanguage('dockerfile', dockerfile)
  // hljs.registerLanguage('dos', dos)
  // hljs.registerLanguage('dsconfig', dsconfig)
  // hljs.registerLanguage('dts', dts)
  // hljs.registerLanguage('dust', dust)
  // hljs.registerLanguage('ebnf', ebnf)
  hljs.registerLanguage('elixir', elixir)
  hljs.registerLanguage('elm', elm)
  // hljs.registerLanguage('erb', erb)
  hljs.registerLanguage('erlang', erlang)
  // hljs.registerLanguage('erlang-repl', erlang-repl)
  // hljs.registerLanguage('excel', excel)
  // hljs.registerLanguage('fix', fix)
  // hljs.registerLanguage('flix', flix)
  hljs.registerLanguage('fortran', fortran)
  hljs.registerLanguage('fsharp', fsharp)
  // hljs.registerLanguage('gams', gams)
  // hljs.registerLanguage('gauss', gauss)
  // hljs.registerLanguage('gcode', gcode)
  // hljs.registerLanguage('gherkin', gherkin)
  hljs.registerLanguage('glsl', glsl)
  // hljs.registerLanguage('gml', gml)
  hljs.registerLanguage('go', go)
  // hljs.registerLanguage('golo', golo)
  hljs.registerLanguage('gradle', gradle)
  hljs.registerLanguage('groovy', groovy)
  hljs.registerLanguage('haml', haml)
  // hljs.registerLanguage('handlebars', handlebars)
  hljs.registerLanguage('haskell', haskell)
  hljs.registerLanguage('haxe', haxe)
  hljs.registerLanguage('hsp', hsp)
  // hljs.registerLanguage('http', http)
  // hljs.registerLanguage('hy', hy)
  // hljs.registerLanguage('inform7', inform7)
  hljs.registerLanguage('ini', ini)
  // hljs.registerLanguage('irpf90', irpf90)
  // hljs.registerLanguage('isbl', isbl)
  hljs.registerLanguage('java', java)
  hljs.registerLanguage('javascript', javascript)
  // hljs.registerLanguage('jboss-cli', jboss-cli)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('julia', julia)
  // hljs.registerLanguage('julia-repl', julia-repl)
  hljs.registerLanguage('kotlin', kotlin)
  // hljs.registerLanguage('lasso', lasso)
  hljs.registerLanguage('latex', latex)
  // hljs.registerLanguage('ldif', ldif)
  // hljs.registerLanguage('leaf', leaf)
  hljs.registerLanguage('less', less)
  hljs.registerLanguage('lisp', lisp)
  // hljs.registerLanguage('livecodeserver', livecodeserver)
  hljs.registerLanguage('livescript', livescript)
  hljs.registerLanguage('llvm', llvm)
  // hljs.registerLanguage('lsl', lsl)
  hljs.registerLanguage('lua', lua)
  hljs.registerLanguage('makefile', makefile)
  hljs.registerLanguage('markdown', markdown)
  hljs.registerLanguage('mathematica', mathematica)
  hljs.registerLanguage('matlab', matlab)
  hljs.registerLanguage('maxima', maxima)
  hljs.registerLanguage('mel', mel)
  // hljs.registerLanguage('mercury', mercury)
  // hljs.registerLanguage('mipsasm', mipsasm)
  // hljs.registerLanguage('mizar', mizar)
  // hljs.registerLanguage('mojolicious', mojolicious)
  // hljs.registerLanguage('monkey', monkey)
  // hljs.registerLanguage('moonscript', moonscript)
  // hljs.registerLanguage('n1ql', n1ql)
  // hljs.registerLanguage('nestedtext', nestedtext)
  hljs.registerLanguage('nginx', nginx)
  hljs.registerLanguage('nim', nim)
  // hljs.registerLanguage('nix', nix)
  // hljs.registerLanguage('node-repl', node-repl)
  hljs.registerLanguage('nsis', nsis)
  hljs.registerLanguage('objectivec', objectivec)
  hljs.registerLanguage('ocaml', ocaml)
  hljs.registerLanguage('openscad', openscad)
  // hljs.registerLanguage('oxygene', oxygene)
  // hljs.registerLanguage('parser3', parser3)
  hljs.registerLanguage('perl', perl)
  // hljs.registerLanguage('pf', pf)
  hljs.registerLanguage('pgsql', pgsql)
  hljs.registerLanguage('php', php)
  // hljs.registerLanguage('php-template', php-template)
  // hljs.registerLanguage('plaintext', plaintext)
  // hljs.registerLanguage('pony', pony)
  hljs.registerLanguage('powershell', powershell)
  hljs.registerLanguage('processing', processing)
  // hljs.registerLanguage('profile', profile)
  hljs.registerLanguage('prolog', prolog)
  // hljs.registerLanguage('properties', properties)
  hljs.registerLanguage('protobuf', protobuf)
  hljs.registerLanguage('puppet', puppet)
  // hljs.registerLanguage('purebasic', purebasic)
  hljs.registerLanguage('python', python)
  // hljs.registerLanguage('python-repl', python-repl)
  // hljs.registerLanguage('q', q)
  hljs.registerLanguage('qml', qml)
  hljs.registerLanguage('r', r)
  hljs.registerLanguage('reasonml', reasonml)
  // hljs.registerLanguage('rib', rib)
  // hljs.registerLanguage('roboconf', roboconf)
  // hljs.registerLanguage('routeros', routeros)
  // hljs.registerLanguage('rsl', rsl)
  hljs.registerLanguage('ruby', ruby)
  // hljs.registerLanguage('ruleslanguage', ruleslanguage)
  hljs.registerLanguage('rust', rust)
  hljs.registerLanguage('sas', sas)
  hljs.registerLanguage('scala', scala)
  hljs.registerLanguage('scheme', scheme)
  hljs.registerLanguage('scilab', scilab)
  hljs.registerLanguage('scss', scss)
  hljs.registerLanguage('shell', shell)
  // hljs.registerLanguage('smali', smali)
  hljs.registerLanguage('smalltalk', smalltalk)
  hljs.registerLanguage('sml', sml)
  // hljs.registerLanguage('sqf', sqf)
  hljs.registerLanguage('sql', sql)
  hljs.registerLanguage('stan', stan)
  hljs.registerLanguage('stata', stata)
  // hljs.registerLanguage('step21', step21)
  hljs.registerLanguage('stylus', stylus)
  // hljs.registerLanguage('subunit', subunit)
  hljs.registerLanguage('swift', swift)
  // hljs.registerLanguage('taggerscript', taggerscript)
  // hljs.registerLanguage('tap', tap)
  hljs.registerLanguage('tcl', tcl)
  hljs.registerLanguage('thrift', thrift)
  // hljs.registerLanguage('tp', tp)
  hljs.registerLanguage('twig', twig)
  hljs.registerLanguage('typescript', typescript)
  // hljs.registerLanguage('vala', vala)
  hljs.registerLanguage('vbnet', vbnet)
  hljs.registerLanguage('vbscript', vbscript)
  // hljs.registerLanguage('vbscript-html', vbscript-html)
  hljs.registerLanguage('verilog', verilog)
  hljs.registerLanguage('vhdl', vhdl)
  hljs.registerLanguage('vim', vim)
  hljs.registerLanguage('wasm', wasm)
  // hljs.registerLanguage('wren', wren)
  // hljs.registerLanguage('x86asm', x86asm)
  // hljs.registerLanguage('xl', xl)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('xquery', xquery)
  hljs.registerLanguage('yaml', yaml)
  hljs.registerLanguage('zephir', zephir)
}
