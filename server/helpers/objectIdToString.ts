// import { ObjectId } from "mongodb";
//
// export function ObjectIdToString(obj: any) {
//   if (typeof obj !== "object") return null;
//
//   const temp = { ...obj };
//
//   for (const item in temp) {
//     if (typeof temp[item] === "object") {
//       if (isValidObjectId(temp[item])) {
//         if (temp[item] !== null && !(temp[item] instanceof Date)) {
//           temp[item] = temp[item].toHexString();
//           continue;
//         }
//         continue;
//       }
//       ObjectIdToString(temp[item]);
//     }
//   }
//
//   return temp;
// }
//
// function isValidObjectId(obj: ObjectId) {
//   if (obj) if (obj._bsontype === "ObjectID") return true;
//   return false;
// }
