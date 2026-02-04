function marcarComoRealizado(type, date, index) {
  const storeMap = {
    schedule: 'schedules',
    activity: 'activities',
    hearing: 'hearings'
  };

  const key = storeMap[type];
  if (!key) return;

  const data = JSON.parse(localStorage.getItem(key) || '{}');

  if (!data[date] || !data[date][index]) return;

  data[date][index].status = 'realizado';

  localStorage.setItem(key, JSON.stringify(data));
}
