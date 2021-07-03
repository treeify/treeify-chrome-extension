export type PageTreeBulletAndIndentProps = {
  bulletState: PageTreeBulletState
}

export enum PageTreeBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
}

export function createPageTreeBulletAndIndentProps(
  hasChildren: boolean
): PageTreeBulletAndIndentProps {
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
