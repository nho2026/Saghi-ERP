import { formsModel } from "./forms.model.js";

export const formsService = {
  templates: () => formsModel.templates(),
  activeTemplates: () => formsModel.activeTemplates(),
  createTemplate: (data) => formsModel.createTemplate(data),
  updateTemplate: (id, data) => formsModel.updateTemplate(id, data),
  removeTemplate: (id) => formsModel.removeTemplate(id),
  submissions: (patientId) => formsModel.submissions(patientId),
  async createSubmission(patientId, payload, submittedById) {
    const template = await formsModel.template(payload.formTemplateId);
    const missing = template.fields
      .filter((field) => field.required)
      .filter((field) => {
        const value = payload.data[field.id];
        return value === undefined || value === null || value === "";
      });
    if (missing.length) {
      const error = new Error(
        `Required fields are missing: ${missing.map((field) => field.label).join(", ")}`,
      );
      error.status = 400;
      throw error;
    }
    return formsModel.createSubmission({
      patientId,
      formTemplateId: payload.formTemplateId,
      data: payload.data,
      submittedById,
    });
  },
  removeSubmission: (id) => formsModel.removeSubmission(id),
};
