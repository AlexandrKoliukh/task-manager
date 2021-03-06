// @ts-check

import i18next from 'i18next';
import _ from 'lodash';
import LabelRepository from '../repositories/LabelRepository';

const resource = '/labels';

export default (app) => {
  const labelRepository = new LabelRepository(app);
  app
    .get(
      resource,
      { name: 'labels', preHandler: app.auth([app.verifySignedIn]) },
      async (req, reply) => {
        const labels = await labelRepository.getAll();
        reply.render('labels/index', { labels });
      }
    )
    .get(
      `${resource}/:id/edit`,
      { name: 'labels/edit', preHandler: app.auth([app.verifySignedIn]) },
      async (req, reply) => {
        const labelId = _.toNumber(req.params.id);
        const label = await labelRepository.getById(labelId);

        if (!label) {
          reply.code(404);
          reply.redirect(app.reverse('labels'));
        }

        reply.render('labels/edit', { label });
      }
    )
    .get(
      `${resource}/new`,
      { name: 'labels/new', preHandler: app.auth([app.verifySignedIn]) },
      async (req, reply) => {
        const label = new app.objection.models.label();

        reply.render('labels/new', { label });
      }
    )
    .post(
      resource,
      { name: 'labels/create', preHandler: app.auth([app.verifySignedIn]) },
      async (req, reply) => {
        try {
          await labelRepository.insert(req.body.label);
          req.flash('info', i18next.t('flash.label.new.success'));
          reply.redirect(app.reverse('labels'));
        } catch (e) {
          const label = await app.objection.models.label.fromJson(
            req.body.label
          );
          reply.log.error(e);
          req.flash('error', i18next.t('flash.errors.common'));
          reply.render('labels/new', { label, errors: e.data });
        }
      }
    )
    .patch(
      `${resource}/:id`,
      { name: 'labels/update', preHandler: app.auth([app.verifySignedIn]) },
      async (req, reply) => {
        const labelId = _.toNumber(req.params.id);
        const { label } = req.body;

        try {
          await labelRepository.update(labelId, label);
          req.flash('info', i18next.t('flash.label.edit.success'));
          reply.redirect(app.reverse('labels'));
        } catch (e) {
          reply.log.error(e);
          req.flash('error', i18next.t('flash.errors.common'));
          reply.render('labels/edit', { label, errors: e.data });
        }

        reply.redirect(app.reverse('labels'));
      }
    )
    .delete(
      `${resource}/:id`,
      { name: 'labels/delete', preHandler: app.auth([app.verifySignedIn]) },
      async (req, reply) => {
        const labelId = _.toNumber(req.params.id);
        try {
          await labelRepository.delete(labelId);
          req.flash('info', i18next.t('flash.label.delete.success'));
        } catch (e) {
          reply.log.error(e);
          req.flash('error', i18next.t('flash.errors.common'));
        }

        reply.redirect(app.reverse('labels'));
      }
    );
};
