<?php

N2Loader::import('libraries.slider.generator.N2SmartSliderGeneratorAbstract', 'smartslider');

class N2GeneratorTheEventsCalendarEvents extends N2GeneratorAbstract
{

    protected function _getData($count, $startIndex) {
        $tax_query  = array();
        $meta_query = array();

        $categories = explode('||', $this->data->get('categories', 0));
        if (!in_array(0, $categories)) {
            $tax_query[] = array(
                'taxonomy' => 'tribe_events_cat',
                'field'    => 'term_id',
                'terms'    => $categories
            );
        }

        $tags = explode('||', $this->data->get('tags', 0));
        if (!in_array(0, $tags)) {
            $tax_query[] = array(
                'taxonomy' => 'post_tag',
                'field'    => 'term_id',
                'terms'    => $tags
            );
        }

        $organizers = explode('||', $this->data->get('organizers', 0));
        if (!in_array(0, $organizers)) {
            if (count($organizers)) {
                $meta_query[] = array(
                    'key'   => '_EventOrganizerID',
                    'value' => $organizers
                );
            }
        }

        $venues = explode('||', $this->data->get('venues', 0));
        if (!in_array(0, $venues)) {
            if (count($venues)) {
                $meta_query[] = array(
                    'key'   => '_EventVenueID',
                    'value' => $venues
                );
            }
        }


        $today = current_time('mysql');

        switch ($this->data->get('started', '0')) {
            case 1:
                $meta_query[] = array(
                    'key'     => '_EventStartDate',
                    'value'   => $today,
                    'type'    => 'date',
                    'compare' => '<'
                );
                break;
            case -1:
                $meta_query[] = array(
                    'key'     => '_EventStartDate',
                    'value'   => $today,
                    'type'    => 'date',
                    'compare' => '>='
                );
                break;
        }

        switch ($this->data->get('ended', '-1')) {
            case 1:
                $meta_query[] = array(
                    'key'     => '_EventEndDate',
                    'value'   => $today,
                    'type'    => 'date',
                    'compare' => '<'
                );
                break;
            case -1:
                $meta_query[] = array(
                    'key'     => '_EventEndDate',
                    'value'   => $today,
                    'type'    => 'date',
                    'compare' => '>='
                );
                break;
        }

        $args = array(
            'offset'           => $startIndex,
            'posts_per_page'   => $count,
            'post_parent'      => '',
            'post_status'      => 'publish',
            'suppress_filters' => true,
            'post_type'        => 'tribe_events',
            'tax_query'        => $tax_query,
            'meta_query'       => $meta_query
        );

        $order = explode("|*|", $this->data->get('order', '_EventStartDate|*|asc'));
        if ($order[0][0] == '_') {
            $args['orderby']  = 'meta_value'; //meta_value = strval, meta_value_num = intval
            $args['meta_key'] = $order[0];
        } else {
            $args['orderby'] = $order[0];
        }
        $args['order'] = $order[1];

        $posts_array = get_posts($args);

        //need a one level array, because of ordering with group result
        $data = array();

        for ($i = 0; $i < count($posts_array); $i++) {
            $post_meta = get_post_meta($posts_array[$i]->ID);
            //post data
            $data[$i]['title']       = $posts_array[$i]->post_title;
            $data[$i]['description'] = $posts_array[$i]->post_content;
            $data[$i]['image']       = N2ImageHelper::dynamic(wp_get_attachment_url(get_post_thumbnail_id($posts_array[$i]->ID)));
            $thumbnail               = wp_get_attachment_image_src(get_post_thumbnail_id($posts_array[$i]->ID, 'thumbnail'));
            if ($thumbnail[0]) {
                $data[$i]['thumbnail'] = N2ImageHelper::dynamic($thumbnail[0]);
            } else {
                $data[$i]['thumbnail'] = $data['image'];
            }
            $data[$i]['url'] = get_permalink($posts_array[$i]->ID);

            $start                  = strtotime($post_meta['_EventStartDate'][0]);
            $data[$i]['start_date'] = date_i18n(get_option('date_format'), $start);
            $data[$i]['start_time'] = date_i18n(get_option('time_format'), $start);

            $end                  = strtotime($post_meta['_EventEndDate'][0]);
            $data[$i]['end_date'] = date_i18n(get_option('date_format'), $end);
            $data[$i]['end_time'] = date_i18n(get_option('time_format'), $end);

            $data[$i]['ID'] = $posts_array[$i]->ID;

            $data[$i]['EventCurrencySymbol'] = $post_meta['_EventCurrencySymbol'][0];
            $data[$i]['EventCost']           = $post_meta['_EventCost'][0];
            $data[$i]['EventURL']            = $post_meta['_EventURL'][0];

            //venue
            $extra_post_meta           = get_post_meta($post_meta['_EventVenueID'][0]);
            $data[$i]['VenueName']     = get_the_title($post_meta['_EventVenueID'][0]);
            $data[$i]['VenueAddress']  = $extra_post_meta['_VenueAddress'][0];
            $data[$i]['VenueCity']     = $extra_post_meta['_VenueCity'][0];
            $data[$i]['VenueCountry']  = $extra_post_meta['_VenueCountry'][0];
            $data[$i]['VenueProvince'] = $extra_post_meta['_VenueProvince'][0];
            $data[$i]['VenueState']    = $extra_post_meta['_VenueState'][0];
            $data[$i]['VenueZip']      = $extra_post_meta['_VenueZip'][0];
            $data[$i]['VenuePhone']    = $extra_post_meta['_VenuePhone'][0];
            $data[$i]['VenueURL']      = $extra_post_meta['_VenueURL'][0];

            //organizer
            $extra_post_meta              = get_post_meta($post_meta['_EventOrganizerID'][0]);
            $data[$i]['OrganizerName']    = get_the_title($post_meta['_EventOrganizerID'][0]);
            $data[$i]['OrganizerPhone']   = $extra_post_meta['_OrganizerPhone'][0];
            $data[$i]['OrganizerWebsite'] = $extra_post_meta['_OrganizerWebsite'][0];
            $data[$i]['OrganizerEmail']   = $extra_post_meta['_OrganizerEmail'][0];

        }
        return $data;
    }

}
