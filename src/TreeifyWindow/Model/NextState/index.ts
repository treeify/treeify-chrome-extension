/**
 * ModelのnextStateを操作するメソッドを集約するための名前空間。
 * 肥大化した際に複数ファイルに分割できるようにクラスではなく名前空間にしてある。
 */
import * as NextState from 'src/TreeifyWindow/Model/NextState/all'

export {NextState}
// TODO: 本来は次の形式で書くべきだが、WebStormが未対応らしくNextStateの入力補完が効かなくなる
// export * as NextState from "src/TreeifyWindow/Model/NextState/all";
