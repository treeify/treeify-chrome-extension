export type PageTreeBulletAndIndentViewModel = {
  bulletState: PageTreeBulletState
}

export enum PageTreeBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
}

export function createPageTreeBulletAndIndentViewModel(
  hasChildren: boolean
): PageTreeBulletAndIndentViewModel {
  if (hasChildren) {
    return {
      bulletState: PageTreeBulletState.EXPANDED,
    }
  } else {
    return {
      bulletState: PageTreeBulletState.NO_CHILDREN,
    }
  }
}
