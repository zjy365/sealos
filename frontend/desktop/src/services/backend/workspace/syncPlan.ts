// import { getRegionUid } from '@/services/enable';
// import { globalPrisma, prisma } from '../db/init';
// import { AccessTokenPayload } from '@/types/token';
// import { JoinStatus, Role } from 'prisma/region/generated/client';
// // 只同步，不检测
// export async function syncWorkspaceUsage({ userCrUid, userUid }: AccessTokenPayload) {
//   try {
//     // 获取当前区域的 UID
//     const regionUid = getRegionUid();
//     // 获取 user workspaceUsage
//     const userWorkspaceUsage = await globalPrisma.workspaceUsage.findMany({
//       where: {
//         userUid
//       }
//     });
//     // 获取 usercr workspace
//     const relationResult = await prisma.userWorkspace.findMany({
//       where: {
//         userCrUid,
//         role: Role.OWNER
//         // status: JoinStatus.IN_WORKSPACE
//       },
//       select: {
//         workspace: {
//           select: {
//             userWorkspace: true
//           }
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error synchronizing WorkspaceUsage:', error);
//   } finally {
//     await globalPrisma.$disconnect();
//     await regionPrisma.$disconnect();
//   }
// }
