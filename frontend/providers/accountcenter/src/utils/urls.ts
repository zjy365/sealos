const pageUrls = {
  plan: '/plan',
  setting: '/setting',
  billing: '/billing',
  usage: '/usage'
};
const scenes = {
  upgrade: {
    hash: '#upgrade',
    page: pageUrls.plan
  }
};
const urls = {
  scenes,
  page: pageUrls,
  getSceneRedirectUrl(sceneKey: string | null | undefined) {
    if (!sceneKey) return null;
    const scene = scenes[sceneKey as keyof typeof scenes];
    if (scene) return `${scene.page}${scene.hash}`;
    return null;
  }
};
export default urls;
