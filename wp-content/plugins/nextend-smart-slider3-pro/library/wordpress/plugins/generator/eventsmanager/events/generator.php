<?php

N2Loader::import('libraries.slider.generator.N2SmartSliderGeneratorAbstract', 'smartslider');

class N2GeneratorEventsManagerEvents extends N2GeneratorAbstract
{

    protected function _getData($count, $startIndex) {
        global $wpdb, $post;
        $tmpPost = $post;
        $data = array();

        $tax_query  = array();
        $meta_query = array();

        $categories = explode('||', $this->data->get('categories', 0));
        if (!in_array(0, $categories)) {
            $tax_query[] = array(
                'taxonomy' => 'event-categories',
                'field'    => 'term_id',
                'terms'    => $categories
            );
        }

        $tags = explode('||', $this->data->get('tags', 0));
        if (!in_array(0, $tags)) {
            $tax_query[] = array(
                'taxonomy' => 'event-tags',
                'field'    => 'term_id',
                'terms'    => $tags
            );
        }

        $locations = explode('||', $this->data->get('locations', 0));
        if (!in_array(0, $locations)) {

            $locations = $wpdb->get_results("SELECT location_id FROM " . $wpdb->base_prefix . "em_locations WHERE post_id IN (" . implode(',', $locations) . ")");

            $locationIDs = array();

            for ($i = 0; $i < count($locations); $i++) {
                $locationIDs[$i] = $locations[$i]->location_id;
            }
            if (count($locationIDs)) {
                $meta_query[] = array(
                    'key'   => '_location_id',
                    'value' => $locationIDs
                );
            }
        }


        $today = strtotime(date('Y-m-d', current_time('timestamp')));

        switch ($this->data->get('started', '0')) {
            case 1:
                $meta_query[] = array(
                    'key'     => '_start_ts',
                    'value'   => $today,
                    'compare' => '<'
                );
                break;
            case -1:
                $meta_query[] = array(
                    'key'     => '_start_ts',
                    'value'   => $today,
                    'compare' => '>='
                );
                break;
        }

        switch ($this->data->get('ended', '-1')) {
            case 1:
                $meta_query[] = array(
                    'key'     => '_end_ts',
                    'value'   => $today,
                    'compare' => '<'
                );
                break;
            case -1:
                $meta_query[] = array(
                    'key'     => '_end_ts',
                    'value'   => $today,
                    'compare' => '>='
                );
                break;
        }

        $args = array(
            'offset'           => $startIndex,
            'posts_per_page'   => $count,
            'post_parent'      => '',
            'post_status'      => 'publish',
            'suppress_filters' => false,
            'post_type'        => 'event',
            'tax_query'        => $tax_query,
            'meta_query'       => $meta_query
        );

        $order = explode("|*|", $this->data->get('order', '_event_start_date|*|asc'));
        if ($order[0][0] == '_') {
            $args['orderby']  = 'meta_value_num'; //meta_value = strval, meta_value_num = intval
            $args['meta_key'] = $order[0];
        } else {
            $args['orderby'] = $order[0];
        }
        $args['order'] = $order[1];


        add_filter('posts_fields', array(
            $this,
            'posts_fields'
        ));
        add_filter('posts_join', array(
            $this,
            'posts_join'
        ));
        $posts = get_posts($args);
        remove_filter('posts_fields', array(
            $this,
            'posts_fields'
        ));
        remove_filter('posts_join', array(
            $this,
            'posts_join'
        ));
        for ($i = 0; $i < count($posts); $i++) {
            $post = $posts[$i];
            setup_postdata($post);
            //post data
            $data[$i]['title']       = $post->post_title;
            $data[$i]['description'] = $post->post_content;
            $data[$i]['image']       = N2ImageHelper::dynamic(wp_get_attachment_url(get_post_thumbnail_id($post->ID)));
            $thumbnail               = wp_get_attachment_image_src(get_post_thumbnail_id($post->ID, 'thumbnail'));
            if ($thumbnail[0]) {
                $data[$i]['thumbnail'] = N2ImageHelper::dynamic($thumbnail[0]);
            } else {
                $data[$i]['thumbnail'] = $data[$i]['image'];
            }
            $data[$i]['url'] = get_permalink($post->ID);

            $start                  = strtotime($post->event_start_date . ' ' . $post->event_start_time);
            $data[$i]['start_date'] = date_i18n(get_option('date_format'), $start);
            $data[$i]['start_time'] = date_i18n(get_option('time_format'), $start);

            $end                  = strtotime($post->event_end_date . ' ' . $post->event_end_time);
            $data[$i]['end_date'] = date_i18n(get_option('date_format'), $end);
            $data[$i]['end_time'] = date_i18n(get_option('time_format'), $end);

            $data[$i]['ID'] = $post->ID;
            
            $rsvp                  = strtotime($post->event_rsvp_date . ' ' . $post->event_rsvp_time);
            $data[$i]['rsvp_date'] = date_i18n(get_option('date_format'), $rsvp);
            $data[$i]['rsvp_time'] = date_i18n(get_option('time_format'), $rsvp);

            $data[$i]['rsvp_spaces']        = $post->event_rsvp_spaces;
            $data[$i]['spaces']             = $post->event_spaces;
            $data[$i]['location_name']      = $post->location_name;
            $data[$i]['location_address']   = $post->location_address;
            $data[$i]['location_town']      = $post->location_town;
            $data[$i]['location_state']     = $post->location_state;
            $data[$i]['location_postcode']  = $post->location_postcode;
            $data[$i]['location_region']    = $post->location_region;
            $data[$i]['location_country']   = $post->location_country;
            $data[$i]['location_latitude']  = $post->location_latitude;
            $data[$i]['location_longitude'] = $post->location_longitude;
            $data[$i]['ticket_name']        = $post->ticket_name;
            $data[$i]['ticket_description'] = $post->ticket_description;
            $data[$i]['ticket_price']       = $post->ticket_price;
            $data[$i]['ticket_start']       = $post->ticket_start;
            $data[$i]['ticket_end']         = $post->ticket_end;
            $data[$i]['ticket_min']         = $post->ticket_min;
            $data[$i]['ticket_max']         = $post->ticket_max;
            $data[$i]['ticket_spaces']      = $post->ticket_spaces;
        }
        
        wp_reset_postdata();
        $post = $tmpPost;
        if ($post) setup_postdata($post);

        return $data;
    }

    public function posts_fields($fields) {
        return 'events.*, locations.*, tickets.*, ' . $fields;
    }

    public function posts_join($join) {
        global $wpdb;

        return $join . " LEFT JOIN {$wpdb->prefix}em_events AS events ON {$wpdb->posts}.ID = events.post_id " . " LEFT JOIN {$wpdb->prefix}em_locations AS locations ON events.location_id = locations.location_id " . " LEFT JOIN {$wpdb->prefix}em_tickets AS tickets ON events.event_id = tickets.event_id ";
    }

}
