import { MDObject, MCObject } from './MDObject';

const MDUser = MDObject.extend({
  storageName: 'CurrentObject',
  defaults: {},
  validators: {
    group1: {

    }
  },

});

const MCUser = MCObject.extend({
  model: MDUser,
});

/**
 * 是否已经授权
 */
MDUser.isAuthed = function () {
  return new Promise((ok, no) => {
    if(!uni.app.checkLocalLogin()) return ok(false);
    (new MDObject()).fetch({
      url: '/auth/is_auth',
      originData: true,
    }).then(data => {
      ok(data);
    }).catch(error => {
      no(error);
    });
  });
};

export { MDUser, MCUser };
