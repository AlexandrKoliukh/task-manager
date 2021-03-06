// @ts-check

import i18next from 'i18next';
import _ from 'lodash';
import UserRepository from '../repositories/UserRepository';

export default (app) => {
  const userRepository = new UserRepository(app);
  const keys = ['firstName', 'lastName', 'email'];

  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await userRepository.getAll();

      reply.render('users/index', { users });
    })
    .get(
      '/users/:id/edit',
      { name: 'users/edit', preHandler: app.auth([app.verifySession]) },
      async (req, reply) => {
        const userId = _.toNumber(req.params.id);

        const user = await userRepository.getById(userId);

        reply.render('users/edit', { user, keys });
      }
    )
    .get('/users/new', { name: 'users/new' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .post('/users', { name: 'users/create' }, async (req, reply) => {
      const user = await app.objection.models.user.fromJson(req.body.user);
      try {
        await userRepository.insert(req.body.user);
        req.flash('info', i18next.t('flash.user.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (e) {
        reply.log.error(e);
        req.flash('error', i18next.t('flash.user.create.error'));
        reply.render('users/new', { user, errors: e.data });
      }
    })
    .patch('/users/:id', { name: 'users/update' }, async (req, reply) => {
      const userId = _.toNumber(req.params.id);
      const { password, user: newUserData } = req.body;

      try {
        const oldUser = await userRepository.getById(userId);
        const patchObject = _.keys(newUserData).reduce((acc, i) => {
          if (newUserData[i] === oldUser[i]) return acc;
          return { ...acc, [i]: newUserData[i] };
        }, {});

        if (password) {
          patchObject.password = password;
        }
        const updatedUser = await userRepository.update(userId, patchObject);
        req.session.set('email', updatedUser.email);
        req.flash('info', i18next.t('flash.user.update.success'));
        reply.redirect(app.reverse('users/edit', { id: userId }));
      } catch (e) {
        reply.log.error(e);
        req.flash('error', i18next.t('flash.user.update.error'));
        reply.render('users/edit', { user: newUserData, keys, errors: e.data });
      }
      reply.redirect(app.reverse('users/edit', { id: userId }));
    })
    .delete('/users/:id', { name: 'users/delete' }, async (req, reply) => {
      try {
        const paramsUserId = _.toNumber(req.params.id);
        await userRepository.delete(paramsUserId);
        req.flash('info', i18next.t('flash.user.delete.success'));
        req.session.delete();
      } catch (e) {
        reply.log.error(e);
        req.flash('error', i18next.t('flash.user.delete.error'));
      }

      reply.redirect(app.reverse('root'));
    });
};
