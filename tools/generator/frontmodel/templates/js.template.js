import { MD<%=parentName%>, MC<%=parentName%> } from './MD<%=parentName%>';

const MD<%=filename%> = MD<%=parentName%>.extend({
  storageName: 'Current<%=filename%>',
  defaults: {},
  validators: {
    group1: {

    }
  },

});

const MC<%=filename%> = MC<%=parentName%>.extend({
  model: MD<%=filename%>,
});

export { MD<%=filename%>, MC<%=filename%> };
