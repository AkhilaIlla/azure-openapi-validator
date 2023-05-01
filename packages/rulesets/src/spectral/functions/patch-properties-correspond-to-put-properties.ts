// Validates that each patch request body contains one or more properties present in the corresponding put request body,
// and contains only properties present in the put request body.
// RPC Code: RPC-Patch-V1-01

import _ from "lodash"

const ERROR_MESSAGE =
  "A patch request body must only contain properties present in the corresponding put request body, and must contain at least one of the properties."
const PARAM_IN_BODY = (paramObject: any) => paramObject.in === "body"
const PATCH = "patch"
const PUT = "put"
const PARAMETERS = "parameters"

export const patchPropertiesCorrespondToPutProperties = (pathItem: any, _opts: any, ctx: any) => {
  if (pathItem === null || typeof pathItem !== "object") {
    return []
  }

  const path = ctx.path.concat([PATCH, PARAMETERS])

  const error = [{ message: ERROR_MESSAGE, path: path }]

  // array of all the patch body parameters
  const patchBodyParameters: any[] = pathItem[PATCH]?.parameters?.filter(PARAM_IN_BODY).map((p) => p.schema) ?? []
  // array of all the put body parameters
  const putBodyParameters: any[] = pathItem[PUT]?.parameters?.filter(PARAM_IN_BODY) ?? []

  const patchBodyEmpty = patchBodyParameters.length < 1
  const putBodyEmpty = putBodyParameters.length < 1

  // both the patch body and put body are empty => ignore
  if (patchBodyEmpty && putBodyEmpty) {
    return []
  }

  // patch body is empty while put body nonempty
  // or patch body nonempty while put body empty => error
  if (patchBodyEmpty != putBodyEmpty) {
    return error
  }

  // array of all the patch body parameters that are not present in the put body (if any)
  const patchBodyParametersNotInPutBody = _.differenceWith(patchBodyParameters, putBodyParameters, _.isEqual)

  // there is at least one parameter present in the patch body that is not present in the the put body => error
  if (patchBodyParametersNotInPutBody.length > 0) {
    return patchBodyParametersNotInPutBody.map((param) => ({
      message: `Parameter${param.name ? ` with name '${param.name}'` : ""} in patch body is not present in the corresponding put body.`,
      path: param.name ? path.push(param.name) : path,
    }))
  }

  return []
}
