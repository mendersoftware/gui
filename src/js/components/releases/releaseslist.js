import React, { useMemo } from 'react';

import { makeStyles } from 'tss-react/mui';

import { SORTING_OPTIONS } from '../../constants/appConstants';
import { DEVICE_LIST_DEFAULTS } from '../../constants/deviceConstants';
import DetailsTable from '../common/detailstable';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import { RelativeTime } from '../common/time';

const canShow = () => true;

const columns = [
  {
    key: 'name',
    title: 'Name',
    render: ({ Name }) => Name,
    sortable: true,
    defaultSortDirection: SORTING_OPTIONS.asc,
    canShow
  },
  {
    key: 'artifacts-count',
    title: 'Number of artifacts',
    render: ({ Artifacts = [] }) => Artifacts.length,
    canShow
  },
  {
    key: 'tags',
    title: 'Tags',
    render: ({ tags = [] }) => tags.join(', ') || '-',
    canShow: ({ features: { hasReleaseTags } }) => hasReleaseTags
  },
  {
    key: 'modified',
    title: 'Last modified',
    render: ({ modified }) => <RelativeTime updateTime={modified} />,
    defaultSortDirection: SORTING_OPTIONS.desc,
    sortable: true,
    canShow
  }
];

const useStyles = makeStyles()(() => ({
  container: { maxWidth: 1600 }
}));

const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

export const ReleasesList = ({ features, onSelect, releasesListState, releases, setReleasesListState }) => {
  const { isLoading, page = defaultPage, perPage = defaultPerPage, searchTerm, sort = {}, searchTotal, total } = releasesListState;
  const { key: attribute, direction } = sort;
  const { classes } = useStyles();

  const onChangeSorting = sortKey => {
    let sort = { key: sortKey, direction: direction === SORTING_OPTIONS.asc ? SORTING_OPTIONS.desc : SORTING_OPTIONS.asc };
    if (sortKey !== attribute) {
      sort = { ...sort, direction: columns.find(({ key }) => key === sortKey)?.defaultSortDirection ?? SORTING_OPTIONS.desc };
    }
    setReleasesListState({ page: 1, sort });
  };

  const onChangePagination = (page, currentPerPage = perPage) => setReleasesListState({ page, perPage: currentPerPage });

  const applicableColumns = useMemo(
    () =>
      columns.reduce((accu, column) => {
        if (column.canShow({ features })) {
          accu.push(column);
        }
        return accu;
      }, []),
    [JSON.stringify(features)]
  );

  const potentialTotal = searchTerm ? searchTotal : total;
  return (
    <div className={classes.container}>
      {isLoading === undefined ? (
        <Loader show />
      ) : !potentialTotal ? (
        <p className="margin-top muted align-center margin-right">There are no Releases {searchTerm ? `for ${searchTerm}` : 'yet'}</p>
      ) : (
        <>
          <DetailsTable columns={applicableColumns} items={releases} onItemClick={onSelect} sort={sort} onChangeSorting={onChangeSorting} />
          <Pagination
            className="margin-top-none"
            count={potentialTotal}
            rowsPerPage={perPage}
            onChangePage={onChangePagination}
            onChangeRowsPerPage={newPerPage => onChangePagination(1, newPerPage)}
            page={page}
          />
        </>
      )}
    </div>
  );
};

export default ReleasesList;
