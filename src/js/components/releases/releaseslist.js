// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useMemo, useRef } from 'react';

import { makeStyles } from 'tss-react/mui';

import { SORTING_OPTIONS, canAccess as canShow } from '../../constants/appConstants';
import { DEVICE_LIST_DEFAULTS } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import DetailsTable from '../common/detailstable';
import Loader from '../common/loader';
import Pagination from '../common/pagination';
import { RelativeTime } from '../common/time';

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

export const ReleasesList = ({ artifactIncluded, features, onboardingState, onSelect, releasesListState, releases, setReleasesListState }) => {
  const { isLoading, page = defaultPage, perPage = defaultPerPage, searchTerm, sort = {}, searchTotal, total } = releasesListState;
  const { key: attribute, direction } = sort;
  const repoRef = useRef();
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

  let onboardingComponent = null;
  if (repoRef.current?.lastChild?.lastChild) {
    const element = repoRef.current.lastChild.lastChild;
    const anchor = { left: element.offsetLeft + element.offsetWidth / 2, top: element.offsetTop + element.offsetParent?.offsetTop + element.offsetHeight };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.ARTIFACT_INCLUDED_ONBOARDING, { ...onboardingState, artifactIncluded }, { anchor });
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED, onboardingState, { anchor }, onboardingComponent);
  }

  const potentialTotal = searchTerm ? searchTotal : total;
  return (
    <div className={classes.container}>
      {isLoading === undefined ? (
        <Loader show />
      ) : !potentialTotal ? (
        <p className="margin-top muted align-center margin-right">There are no Releases {searchTerm ? `for ${searchTerm}` : 'yet'}</p>
      ) : (
        <>
          <DetailsTable columns={applicableColumns} items={releases} onItemClick={onSelect} sort={sort} onChangeSorting={onChangeSorting} tableRef={repoRef} />
          <div className="flexbox">
            <Pagination
              className="margin-top-none"
              count={potentialTotal}
              rowsPerPage={perPage}
              onChangePage={onChangePagination}
              onChangeRowsPerPage={newPerPage => onChangePagination(1, newPerPage)}
              page={page}
            />
            <Loader show={isLoading} small />
          </div>
          {onboardingComponent}
        </>
      )}
    </div>
  );
};

export default ReleasesList;
